/**
 * API Circuit Breaker & Resilient Fallback Utility
 * Protects downstream AI and database dependencies from hanging requests and cascading failures.
 */

export interface CircuitBreakerOptions {
  failureThreshold?: number; // failure rate (e.g., 0.5 = 50%)
  windowMs?: number; // evaluation window (default 60,000ms)
  coolOffMs?: number; // open state cool-off duration (default 30,000ms)
  minRequests?: number; // min samples before evaluating threshold (default 5)
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = 'CLOSED';
  private failureThreshold: number;
  private windowMs: number;
  private coolOffMs: number;
  private minRequests: number;

  private requests: Array<{ timestamp: number; success: boolean }> = [];
  private openUntil = 0;

  constructor(name: string, options?: CircuitBreakerOptions) {
    this.name = name;
    this.failureThreshold = options?.failureThreshold ?? 0.5;
    this.windowMs = options?.windowMs ?? 60_000;
    this.coolOffMs = options?.coolOffMs ?? 30_000;
    this.minRequests = options?.minRequests ?? 5;
  }

  isOpen(): boolean {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now >= this.openUntil) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false;
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.requests = [];
    }
    this.addRecord(true);
  }

  recordFailure(): void {
    this.addRecord(false);
    this.evaluate();
  }

  private addRecord(success: boolean): void {
    const now = Date.now();
    this.requests.push({ timestamp: now, success });
    this.prune(now);
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    this.requests = this.requests.filter((r) => r.timestamp > cutoff);
  }

  private evaluate(): void {
    const now = Date.now();
    this.prune(now);

    if (this.requests.length < this.minRequests) return;

    const failures = this.requests.filter((r) => !r.success).length;
    const rate = failures / this.requests.length;

    if (rate >= this.failureThreshold) {
      this.state = 'OPEN';
      this.openUntil = now + this.coolOffMs;
    }
  }

  async execute<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      return fallback();
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      return fallback();
    }
  }

  getState(): CircuitState {
    this.isOpen(); // trigger potential state update
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.requests = [];
    this.openUntil = 0;
  }
}

// Global registry of circuit breakers for AI and external services
const registry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
  let cb = registry.get(name);
  if (!cb) {
    cb = new CircuitBreaker(name, options);
    registry.set(name, cb);
  }
  return cb;
}
