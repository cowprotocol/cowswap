import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

// Mod imports
import { useWalletInfo } from 'hooks/useWalletInfo'
import { getConnectionName, getIsMetaMask, getConnection } from 'connection/utils'
import { googleAnalytics, GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY } from '..'
import { Dimensions } from '../GoogleAnalyticsProvider'
import usePrevious from 'hooks/usePrevious'

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

let initiatedPixel = false

// tracks web vitals and pageviews
export function useAnalyticsReporter() {
  const { pathname, search } = useLocation()

  // Handle chain id custom dimension
  const { chainId, connector, account } = useWeb3React()
  const prevAccount = usePrevious(account)

  useEffect(() => {
    // custom dimension 1 - chainId
    googleAnalytics.setDimension(Dimensions.chainId, chainId)
  }, [chainId])

  // Handle wallet name custom dimension
  const walletInfo = useWalletInfo()
  const connection = getConnection(connector)
  const isMetaMask = getIsMetaMask()

  const walletName = walletInfo?.walletName || getConnectionName(connection.type, isMetaMask)

  useEffect(() => {
    // custom dimension 2 - walletname
    googleAnalytics.setDimension(Dimensions.walletName, account ? walletName : 'Not connected')

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account) {
      window.fbq?.('track', 'Contact')
      window.lintrk?.('track', { conversion_id: 10759514 })
      window.twq?.('event', 'tw-oddz2-oddza', {})
      window.rdt?.('track', 'SignUp')
    }
  }, [account, walletName, prevAccount])

  useEffect(() => {
    googleAnalytics.pageview(`${pathname}${search}`)
  }, [pathname, search])

  useEffect(() => {
    reportWebVitals()
    initGATracker()
  }, [])

  // Handle initiate pixel tracking
  useEffect(() => {
    if (!initiatedPixel) {
      window.fbq?.('track', 'InitiateCheckout')
      window.lintrk?.('track', { conversion_id: 10759506 })
      window.twq?.('event', 'tw-oddz2-oddz8', {})
      window.rdt?.('track', 'Lead')

      initiatedPixel = true
    }
  }, [])
}
