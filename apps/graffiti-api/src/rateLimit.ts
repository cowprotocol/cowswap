/**
 * Fixed-window rate limiter, keyed by client address.
 *
 * In-process only: with more than one instance behind a load balancer each
 * replica enforces its own window, so set the limit per replica accordingly
 * (or move this to a shared store).
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>()
  private sweeper: NodeJS.Timeout

  constructor(
    private readonly limit: number,
    private readonly windowMs: number = 60_000,
  ) {
    this.sweeper = setInterval(() => this.sweep(), windowMs)
    this.sweeper.unref()
  }

  /** Records a hit. Returns false when the caller is over the limit. */
  take(key: string): boolean {
    const now = Date.now()
    const entry = this.hits.get(key)
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }
    entry.count++
    return entry.count <= this.limit
  }

  /** Seconds until the caller's window resets, for Retry-After. */
  retryAfter(key: string): number {
    const entry = this.hits.get(key)
    if (!entry) return 0
    return Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000))
  }

  private sweep(): void {
    const now = Date.now()
    for (const [key, entry] of this.hits) {
      if (entry.resetAt <= now) this.hits.delete(key)
    }
  }

  stop(): void {
    clearInterval(this.sweeper)
  }
}
