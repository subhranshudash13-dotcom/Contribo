/**
 * Shared client/network error model for Contribo API calls.
 */

export type ApiErrorCode =
  | 'offline'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'service_unavailable'
  | 'unknown';

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: unknown;

  constructor(
    message: string,
    status = 0,
    code: ApiErrorCode = 'unknown',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isOffline() {
    return this.code === 'offline' || this.code === 'network';
  }

  get isRetryable() {
    return (
      this.code === 'offline' ||
      this.code === 'network' ||
      this.code === 'timeout' ||
      this.code === 'server' ||
      this.code === 'service_unavailable' ||
      this.code === 'rate_limited'
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Map HTTP status → stable client error code. */
export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'service_unavailable';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Human-friendly message for UI surfaces. */
export function friendlyApiMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'offline':
        return 'You appear to be offline. Check your internet connection and try again.';
      case 'network':
        return 'Network error. Check your connection and try again.';
      case 'timeout':
        return 'The request timed out. Please try again.';
      case 'aborted':
        return 'Request was cancelled.';
      case 'unauthorized':
        return 'Please sign in to continue.';
      case 'forbidden':
        return 'You do not have permission to do that.';
      case 'not_found':
        return error.message || 'Resource not found.';
      case 'rate_limited':
        return 'Too many requests. Please wait a moment and try again.';
      case 'validation':
        return error.message || 'Invalid request.';
      case 'service_unavailable':
        return error.message || 'Service temporarily unavailable. Please try again shortly.';
      case 'server':
        return error.message || 'Server error. Please try again shortly.';
      default:
        return error.message || fallback;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
