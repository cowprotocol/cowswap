import { onCookiesAccepted } from '../consent/cookieConsent.store'
import { AnalyticsContext, AnalyticsEvent, CowAnalytics, OutboundLinkParams } from '../CowAnalytics'

type PageViewArgs = Parameters<CowAnalytics['sendPageView']>

interface UserAccount {
  account: string | undefined
  walletName?: string
}

/**
 * Loads the wrapped analytics only once the visitor accepts cookies. Until then it sends nothing and keeps only
 * the latest context, account and page view, which it replays on acceptance.
 */
export class ConsentGatedCowAnalytics implements CowAnalytics {
  private analytics: CowAnalytics | null = null
  private readonly pendingContext = new Map<AnalyticsContext, string | undefined>()
  private pendingAccount: UserAccount | null = null
  private pendingPageView: PageViewArgs | null = null

  constructor(private readonly loadAnalytics: () => CowAnalytics) {
    if (typeof window !== 'undefined') onCookiesAccepted(() => this.activate())
  }

  setUserAccount(account: string | undefined, walletName?: string): void {
    if (this.analytics) {
      this.analytics.setUserAccount(account, walletName)
    } else {
      this.pendingAccount = { account, walletName }
    }
  }

  sendPageView(...args: PageViewArgs): void {
    if (this.analytics) {
      this.analytics.sendPageView(...args)
    } else {
      this.pendingPageView = args
    }
  }

  sendEvent(event: AnalyticsEvent, params?: unknown): void {
    this.analytics?.sendEvent(event, params)
  }

  sendTiming(timingCategory: string, timingVar: string, timingValue: number, timingLabel: string): void {
    this.analytics?.sendTiming(timingCategory, timingVar, timingValue, timingLabel)
  }

  sendError(error: Error, errorInfo?: string): void {
    this.analytics?.sendError(error, errorInfo)
  }

  outboundLink(params: OutboundLinkParams): void {
    if (this.analytics) {
      this.analytics.outboundLink(params)
    } else {
      setTimeout(params.hitCallback, 0)
    }
  }

  setContext(key: AnalyticsContext, value?: string): void {
    if (this.analytics) {
      this.analytics.setContext(key, value)
    } else {
      this.pendingContext.set(key, value)
    }
  }

  // Context goes first, so the replayed account and page view carry it as their dimensions
  private activate(): void {
    const analytics = this.tryLoadAnalytics()

    if (!analytics) return

    this.analytics = analytics
    this.pendingContext.forEach((value, key) => analytics.setContext(key, value))

    if (this.pendingAccount?.account) {
      analytics.setUserAccount(this.pendingAccount.account, this.pendingAccount.walletName)
    }

    if (this.pendingPageView) {
      analytics.sendPageView(...this.pendingPageView)
    }

    this.pendingContext.clear()
    this.pendingAccount = null
    this.pendingPageView = null
  }

  // Runs inside the consent store's notification, so a throwing loader would cut off the store's other subscribers
  private tryLoadAnalytics(): CowAnalytics | null {
    try {
      return this.loadAnalytics()
    } catch {
      return null
    }
  }
}
