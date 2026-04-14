/**
 * No-op analytics implementation for environments where third-party scripts must not load (e.g. embedded widget).
 */

import { AnalyticsContext, CowAnalytics, EventOptions, OutboundLinkParams } from '../CowAnalytics'

const state = {
  instance: null as CowAnalytics | null,
}

class CowAnalyticsNoop implements CowAnalytics {
  private cleanup(): void {
    if (typeof window !== 'undefined') {
      window.cowAnalyticsInstance = undefined
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      if (window.cowAnalyticsInstance) {
        throw new Error('Cow analytics instance already exists — use initGtm() or createNoopCowAnalytics() once')
      }

      window.cowAnalyticsInstance = this
      window.addEventListener('unload', this.cleanup)
    }
  }

  setUserAccount(_account: string | undefined, _walletName?: string): void {}

  sendPageView(_path?: string, _params?: string[], _title?: string): void {}

  sendEvent(_event: string | EventOptions, _params?: unknown): void {}

  sendTiming(_timingCategory: string, _timingVar: string, _timingValue: number, _timingLabel: string): void {}

  sendError(_error: Error, _errorInfo?: string): void {}

  outboundLink({ hitCallback }: OutboundLinkParams): void {
    if (hitCallback && typeof window !== 'undefined') {
      window.setTimeout(hitCallback, 0)
    }
  }

  setContext(_key: AnalyticsContext, _value?: string): void {}
}

/**
 * Returns a singleton no-op CowAnalytics and registers it on window when in the browser.
 */
export function createNoopCowAnalytics(): CowAnalytics {
  if (state.instance) {
    return state.instance
  }

  state.instance = new CowAnalyticsNoop()
  return state.instance
}

/** @internal Testing only */
export function __resetNoopCowAnalyticsInstance(): void {
  if (process.env.NODE_ENV === 'test') {
    state.instance = null
  }
}
