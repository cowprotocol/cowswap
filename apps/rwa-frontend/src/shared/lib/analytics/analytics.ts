import { GTM_ID } from '@cowprotocol/common-const/analytics'

import type { RwaAnalyticsEventName, RwaAnalyticsEvents } from './events'

declare global {
  interface Window {
    dataLayer?: object[]
  }
}

export type AnalyticsDimension = 'chainId' | 'userAddress' | 'walletName'

const GTM_SCRIPT_URL = 'https://www.googletagmanager.com/gtm.js'

const dimensions = new Map<AnalyticsDimension, string>()

/** Adds the CoW Swap GTM container to the page, once */
export function loadGtm(): void {
  if (document.querySelector(`script[src^="${GTM_SCRIPT_URL}"]`)) return

  pushToDataLayer({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `${GTM_SCRIPT_URL}?id=${encodeURIComponent(GTM_ID)}`
  document.head.appendChild(script)
}

/** Sent as `dimension_<key>` with every event, like CoW Swap does */
export function setAnalyticsDimension(key: AnalyticsDimension, value: string | undefined): void {
  if (value === undefined) dimensions.delete(key)
  else dimensions.set(key, value)
}

export function trackEvent<E extends RwaAnalyticsEventName>(event: E, params: RwaAnalyticsEvents[E]): void {
  const dimensionParams = Object.fromEntries([...dimensions].map(([key, value]) => [`dimension_${key}`, value]))
  const definedParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))

  pushToDataLayer({ event, ...dimensionParams, ...definedParams })
}

function pushToDataLayer(entry: object): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(entry)
}
