import ReactGA from 'react-ga4'

import {} from 'web-vitals'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'
export const ANALITICS_EVENTS = {}

export function persistClientId() {
  // typed as 'any' in react-ga4 -.-
  ReactGA.ga((tracker: any) => {
    if (!tracker) return

    const clientId = tracker.get('clientId')
    window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
  })
}

function sendWebVitals({ name, delta, id }: Metric) {
  ReactGA._gaCommandSendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

export function reportWebVitals() {
  getFCP(sendWebVitals)
  getFID(sendWebVitals)
  getLCP(sendWebVitals)
  getCLS(sendWebVitals)
}

export function onChainIdChange(chainId: number | undefined) {
  // cd1 - custom dimension 1 - chainId
  ReactGA.set({ cd1: chainId ?? 0 })
}

export function onPathNameChange(pathname: string, search: string) {
  ReactGA.send({ hitType: 'pageview', page: `${pathname}${search}` })
}
