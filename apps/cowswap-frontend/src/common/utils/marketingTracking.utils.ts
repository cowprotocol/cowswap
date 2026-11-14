import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'

export function isMarketingTrackingDisabled(): boolean {
  return isInjectedWidget() || isIframe() || (typeof window !== 'undefined' && Boolean(window.__COWSWAP_E2E__))
}
