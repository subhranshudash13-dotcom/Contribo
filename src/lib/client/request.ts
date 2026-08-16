/**
 * Low-level browser fetch wrapper with offline detection, timeouts, and
 * consistent error mapping for all Contribo client APIs.
 */

import {
  ApiError,
  codeFromStatus,
  isBrowserOffline,
  type ApiErrorCode,
} from './errors';

export type RequestOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal;
  /** Request timeout in ms (default 30s; 0 disables). */
  timeoutMs?: number;
  /** Skip offline pre-check (rarely needed). */
  allowOfflineAttempt?: boolean;
};

const DEFAULT_TIMEOUT_MS = 30_000;

function mergeSignals(signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter(Boolean) as AbortSignal[];
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal) {
    return AbortSignal.any(active);
  }
  const controller = new AbortController();
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener(
      'abort',
      () => controller.abort(signal.reason),
      { once: true }
    );
  }
  return controller.signal;
}

function mapFetchFailure(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('Request was cancelled', 0, 'aborted');
  }
  if (error instanceof Error && error.name === 'AbortError') {
    // Distinguish timeout vs user abort when possible
    const reason = (error as Error & { cause?: unknown }).message || '';
    if (reason.toLowerCase().includes('timeout')) {
      return new ApiError('Request timed out', 0, 'timeout');
    }
    return new ApiError('Request was cancelled', 0, 'aborted');
  }

  if (isBrowserOffline()) {
    return new ApiError(
      'You appear to be offline. Check your internet connection and try again.',
      0,
      'offline'
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : 'Network request failed',
    0,
    'network'
  );
}

async function parseErrorBody(res: Response): Promise<{ message: string; code?: ApiErrorCode; details?: unknown }> {
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  const message =
    typeof data.error === 'string'
      ? data.error
      : typeof data.message === 'string'
        ? data.message
        : res.statusText || 'Request failed';

  const serverCode =
    typeof data.code === 'string' ? (data.code as ApiErrorCode) : undefined;

  return {
    message,
    code: serverCode,
    details: data.details ?? data,
  };
}

/**
 * Perform a JSON (or raw) fetch with offline/timeout handling.
 * Returns the Response; callers parse JSON via parseJsonResponse.
 */
export async function apiFetch(
  path: string,
  options: RequestOptions = {}
): Promise<Response> {
  if (!options.allowOfflineAttempt && isBrowserOffline()) {
    throw new ApiError(
      'You appear to be offline. Check your internet connection and try again.',
      0,
      'offline'
    );
  }

  const timeoutMs =
    options.timeoutMs === undefined ? DEFAULT_TIMEOUT_MS : options.timeoutMs;

  let timeoutController: AbortController | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs > 0) {
    timeoutController = new AbortController();
    timeoutId = setTimeout(() => {
      timeoutController?.abort(new DOMException('Request timed out', 'AbortError'));
    }, timeoutMs);
  }

  const signal = mergeSignals([options.signal, timeoutController?.signal]);

  try {
    const res = await fetch(path, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal,
    });
    return res;
  } catch (error) {
    // If our timeout fired, surface as timeout
    if (timeoutController?.signal.aborted && !options.signal?.aborted) {
      throw new ApiError('Request timed out', 0, 'timeout');
    }
    throw mapFetchFailure(error);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** Parse JSON body and throw ApiError on non-OK responses. */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const { message, code, details } = await parseErrorBody(res);
    throw new ApiError(
      message,
      res.status,
      code || codeFromStatus(res.status),
      details
    );
  }

  // 204 / empty
  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('Invalid JSON response from server', res.status, 'server');
  }
}

/** Convenience: fetch + parse JSON in one step. */
export async function apiJson<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const res = await apiFetch(path, options);
  return parseJsonResponse<T>(res);
}

/** Build JSON POST/PATCH options. */
export function jsonBody(
  method: string,
  body: unknown,
  extra?: Omit<RequestOptions, 'method' | 'body' | 'headers'> & {
    headers?: HeadersInit;
  }
): RequestOptions {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(extra?.headers || {}),
    },
    body: JSON.stringify(body),
    signal: extra?.signal,
    timeoutMs: extra?.timeoutMs,
    allowOfflineAttempt: extra?.allowOfflineAttempt,
  };
}
