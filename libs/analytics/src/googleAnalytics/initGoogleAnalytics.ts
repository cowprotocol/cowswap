import { CowAnalyticsGoogle } from './CowAnalyticsGoogle'

import { CowAnalytics } from '../CowAnalytics'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'

export function initCowAnalyticsGoogle(loadGTM: boolean = false): CowAnalytics {
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

  // Add GTM loading if specified
  if (loadGTM && typeof window !== 'undefined') {
    loadGoogleTagManager()
  }

  // Add logging to sendEvent
  const originalSendEvent = cowAnalytics.sendEvent.bind(cowAnalytics)
  cowAnalytics.sendEvent = (...args) => {
    // console.debug('CowAnalytics event:', ...args) // TODO: turn on with DEBUG_MODE flag
    return originalSendEvent(...args)
  }

  // Persist analytics client id
  cowAnalytics.ga((tracker: any) => {
    if (!tracker) return

    const clientId = tracker.get('clientId')
    window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
  })

  return cowAnalytics
}

function loadGoogleTagManager() {
  // Add script to head
  const script = document.createElement('script')
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TBX4BV5M');`
  document.head.insertBefore(script, document.head.firstChild)

  // Add noscript iframe to body
  const noscript = document.createElement('noscript')
  const iframe = document.createElement('iframe')
  iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-TBX4BV5M'
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  noscript.appendChild(iframe)
  document.body.insertBefore(noscript, document.body.firstChild)
}
