import { useEffect } from 'react'

import {
  Dimensions,
  GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY,
  googleAnalytics,
  PixelEvent,
  sendAllPixels,
} from '@cowprotocol/analytics'
import { usePrevious } from '@cowprotocol/common-hooks'
import {
  getConnectionName,
  getIsMetaMask,
  getWeb3ReactConnection,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import ReactGA from 'react-ga4'
import { useLocation } from 'react-router-dom'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import { useInjectedWidgetMetaData } from 'modules/injectedWidget'

import { useGetMarketDimension } from './useGetMarketDimension'

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
  const { connector } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const { walletName: _walletName } = useWalletDetails()
  const injectedWidgetMetaData = useInjectedWidgetMetaData()
  const prevAccount = usePrevious(account)

  const marketDimension = useGetMarketDimension()

  useEffect(() => {
    // custom dimension 1 - chainId
    googleAnalytics.setDimension(Dimensions.chainId, chainId)
  }, [chainId])

  // Handle wallet name custom dimension
  const connection = getWeb3ReactConnection(connector)
  const isMetaMask = getIsMetaMask()

  const walletName = _walletName || getConnectionName(connection.type, isMetaMask)

  const injectedWidgetAppId = injectedWidgetMetaData?.appCode

  useEffect(() => {
    // Custom dimension 2 - walletname
    googleAnalytics.setDimension(Dimensions.walletName, account ? walletName : 'Not connected')

    // Custom dimension 4 - user id - because ReactGA.set might not be working
    const userId = account ? `"${account}"` : ''
    googleAnalytics.setDimension(Dimensions.userAddress, userId)
    ReactGA.set({ userId })

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account) {
      sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount])

  useEffect(() => {
    // Custom dimension 5 - market
    googleAnalytics.setDimension(Dimensions.market, marketDimension)
  }, [marketDimension])

  useEffect(() => {
    // Custom dimension 6 - injected widget app id
    googleAnalytics.setDimension(Dimensions.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId])

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
      // // Init all pixels
      // const enablePixelFunctions = [
      //   enablePixelFacebook,
      //   enablePixelMicrosoft,
      //   enablePixelPaved,
      //   enablePixelReddit,
      //   enablePixelTwitter,
      // ]
      // enablePixelFunctions.forEach((enablePixel) => enablePixel())

      // Sent
      sendAllPixels(PixelEvent.INIT)

      initiatedPixel = true
    }
  }, [])
}
