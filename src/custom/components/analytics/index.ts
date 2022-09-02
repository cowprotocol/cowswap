// import { useWeb3React } from '@web3-react/core'
// import { useEffect } from 'react'
import { UaEventOptions } from 'react-ga4/types/ga4'
// import { RouteComponentProps } from 'react-router-dom'
import { isMobile } from 'utils/userAgent'
// import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import GoogleAnalyticsProvider from './GoogleAnalyticsProvider'

// Mod imports
import { ErrorInfo } from 'react'

export { useAnalyticsReporter } from './hooks/useAnalyticsReporter'

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'

const storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)

export const googleAnalytics = new GoogleAnalyticsProvider()

export function sendEvent(event: string | UaEventOptions, params?: any) {
  return googleAnalytics.sendEvent(event, params)
}

export function sendError(error: Error, errorInfo: ErrorInfo) {
  return googleAnalytics.sendError(error, errorInfo)
}

export function outboundLink(
  {
    label,
  }: {
    label: string
  },
  hitCallback: () => unknown
) {
  return googleAnalytics.outboundLink({ label }, hitCallback)
}

if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  googleAnalytics.initialize(GOOGLE_ANALYTICS_ID, {
    legacyDimensionMetric: true,
    gaOptions: {
      storage: 'none',
      storeGac: false,
      clientId: storedClientId ?? undefined,
    },
    gtagOptions: {
      custom_map: {
        dimension1: 'chainId',
        dimension2: 'walletName',
      },
    },
  })
  googleAnalytics.set({
    anonymizeIp: true,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
      ? 'mobileWeb3'
      : 'mobileRegular',
  })
} else {
  googleAnalytics.initialize('test', { gtagOptions: { debug_mode: true } })
}

const installed = Boolean(window.navigator.serviceWorker?.controller)
const hit = Boolean((window as any).__isDocumentCached)
const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'
sendEvent({ category: 'Service Worker', action, nonInteraction: true })

// MOD
export * from './events/listEvents'
export * from './events/settingsEvents'
export * from './events/themeEvents'
export * from './events/transactionEvents'
export * from './events/walletEvents'
export * from './events/swapEvents'
export * from './events/otherEvents'

export enum Category {
  SWAP = 'Swap',
  LIST = 'Lists',
  CURRENCY_SELECT = 'Currency Select',
  EXPERT_MODE = 'Expert mode',
  RECIPIENT_ADDRESS = 'Recipient address',
  ORDER_SLIPAGE_TOLERANCE = 'Order Slippage Tolerance',
  ORDER_EXPIRATION_TIME = 'Order Expiration Time',
  WALLET = 'Wallet',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO',
  THEME = 'Theme',
  GAMES = 'Games',
  EXTERNAL_LINK = 'External Link',
}

export interface EventParams {
  category: Category
  action: string
  label?: string
  value?: number
}
