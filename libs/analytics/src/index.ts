import { isMobile } from '@cowprotocol/common-utils'

import { initAnalytics, serviceWorkerAnalytics } from './events/otherEvents'
import { googleAnalytics } from './googleAnalytics'
import { Dimensions } from './types'

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'

const storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)

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
      cookieFlags: 'SameSite=None; Secure',
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

export * from './events/listEvents'
export * from './events/settingsEvents'
export * from './events/themeEvents'
export * from './events/transactionEvents'
export * from './events/walletEvents'
export * from './events/swapEvents'
export * from './events/otherEvents'
export * from './events/cowFortune'
export * from './events/twapEvents'
export * from './googleAnalytics'
export * from './pixel'
export * from './types'
