import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type AnalyticsEvent = string | EventOptions | (EventOptions & Record<string, unknown>)

export interface CowAnalytics {
  setUserAccount(account: string | undefined, walletName?: string): void
  sendPageView(path?: string, params?: string[], title?: string): void
  sendEvent(event: AnalyticsEvent, params?: unknown): void
  sendTiming(timingCategory: string, timingVar: string, timingValue: number, timingLabel: string): void
  sendError(error: Error, errorInfo?: string): void
  outboundLink(params: OutboundLinkParams): void
  setContext(key: AnalyticsContext, value?: string): void
}

export type EventOptions = {
  /**
   * Event name/action, also used as the GTM `event` name.
   */
  action: string
  /**
   * High-level event bucket used for reporting.
   */
  category: string
  /**
   * Optional free-form text label, kept for existing GTM/GA event_label flows.
   * Prefer named custom params for new metadata when the meaning is specific.
   */
  label?: string
  /**
   * Optional GA-style numeric metric. Use custom params for text metadata like failure reasons.
   */
  value?: number
  /**
   * Whether the event should not affect interaction/bounce metrics.
   */
  nonInteraction?: boolean
  /**
   * Optional chain id attached to chain-specific events.
   */
  chainId?: SupportedChainId
}

export interface OutboundLinkParams {
  label: string
  hitCallback: () => unknown
}

export enum AnalyticsContext {
  chainId = 'chainId',
  walletName = 'walletName',
  customBrowserType = 'customBrowserType',
  userAddress = 'userAddress',
  market = 'market',
  injectedWidgetAppId = 'injectedWidgetAppId',
}
