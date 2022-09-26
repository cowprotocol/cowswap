import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

// Mod imports
import { useWalletInfo } from 'hooks/useWalletInfo'
import { getConnectionName, getIsMetaMask, getConnection } from 'connection/utils'
import { googleAnalytics, GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY } from '..'

export function sendTiming(timingCategory: any, timingVar: any, timingValue: any, timingLabel: any) {
  return googleAnalytics.gaCommandSendTiming(timingCategory, timingVar, timingValue, timingLabel)
}

function sendWebVitals({ name, delta, id }: Metric) {
  sendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

export function reportWebVitals() {
  getFCP(sendWebVitals)
  getFID(sendWebVitals)
  getLCP(sendWebVitals)
  getCLS(sendWebVitals)
}

export function initGATracker() {
  // typed as 'any' in react-ga4 -.-
  googleAnalytics.ga((tracker: any) => {
    if (!tracker) return

    const clientId = tracker.get('clientId')
    window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
  })
}

// tracks web vitals and pageviews
export function useAnalyticsReporter({ pathname, search }: RouteComponentProps['location']) {
  // Handle chain id custom dimension
  const { chainId, connector } = useWeb3React()
  useEffect(() => {
    // custom dimension 1 - chainId
    googleAnalytics.set({ chainId: chainId ?? 0 })
  }, [chainId])

  // Handle wallet name custom dimension
  const walletInfo = useWalletInfo()
  const connection = getConnection(connector)
  const isMetaMask = getIsMetaMask()

  const walletName = walletInfo?.walletName || getConnectionName(connection.type, isMetaMask)

  useEffect(() => {
    // custom dimension 2 - walletname
    googleAnalytics.set({ walletName })
  }, [walletName])

  useEffect(() => {
    googleAnalytics.pageview(`${pathname}${search}`)
  }, [pathname, search])

  useEffect(() => {
    reportWebVitals()
    initGATracker()
  }, [])
}
