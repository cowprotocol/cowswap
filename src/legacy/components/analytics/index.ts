import { ErrorInfo } from 'react'

import { UaEventOptions } from 'react-ga4/types/ga4'

import { isMobile } from 'legacy/utils/userAgent'

import { serviceWorkerAnalytics, initAnalytics } from './events/otherEvents'
import { GAProvider } from './provider'
import { Dimensions } from './types'
export { useAnalyticsReporter } from './hooks/useAnalyticsReporter'

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'

const storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)

export const googleAnalytics = new GAProvider()

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
    gaOptions: {
      storage: 'none',
      storeGac: false,
      clientId: storedClientId ?? undefined,
    },
  })
  googleAnalytics.setDimension(
    Dimensions.customBrowserType,
    !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
  )
} else {
  googleAnalytics.initialize('test', { gtagOptions: { debug_mode: true } })
}

serviceWorkerAnalytics()
initAnalytics()

// MOD
export * from './events/listEvents'
export * from './events/settingsEvents'
export * from './events/themeEvents'
export * from './events/transactionEvents'
export * from './events/walletEvents'
export * from './events/swapEvents'
export * from './events/otherEvents'
