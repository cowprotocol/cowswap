import { CowAnalyticsGoogle } from './CowAnalyticsGoogle'

import { CowAnalytics } from '../CowAnalytics'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'

export function initCowAnalyticsGoogle(): CowAnalytics {
  // Load stored client id
  let storedClientId: string | null = null
  if (typeof window !== 'undefined') {
    storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)
  }

  // Init analytics
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || process.env.REACT_APP_GOOGLE_ANALYTICS_ID

  const cowAnalytics = new CowAnalyticsGoogle({
    googleAnalyticsId,
    options: {
      gaOptions: {
        storage: 'none',
        storeGac: false,
        clientId: storedClientId ?? undefined,
        cookieFlags: 'SameSite=None; Secure',
      },
    },
  })

  // Persist analytics client id
  cowAnalytics.ga((tracker: any) => {
    if (!tracker) return

    const clientId = tracker.get('clientId')
    window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
  })

  return cowAnalytics
}
