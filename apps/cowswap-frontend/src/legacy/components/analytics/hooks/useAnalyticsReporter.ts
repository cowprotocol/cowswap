import { useEffect } from 'react'

import { useWeb3React } from '@web3-react/core'

import ReactGA from 'react-ga4'
import { useLocation } from 'react-router-dom'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

// Mod imports
import usePrevious from 'legacy/hooks/usePrevious'

import { useWalletDetails, useWalletInfo } from 'modules/wallet'
import { getConnectionName, getIsMetaMask } from 'modules/wallet/api/utils/connection'
import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'

import { useGetMarketDimension } from './useGetMarketDimension'

import { googleAnalytics } from '../googleAnalytics'
import { GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY } from '../index'
import { PIXEL_EVENTS } from '../pixel/constants'
import { sendFacebookEvent } from '../pixel/facebook'
import { sendLinkedinEvent } from '../pixel/linkedin'
import { sendMicrosoftEvent } from '../pixel/microsoft'
import { sendPavedEvent } from '../pixel/paved'
import { sendRedditEvent } from '../pixel/reddit'
import { sendTwitterEvent } from '../pixel/twitter'
import { Dimensions } from '../types'

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

  useEffect(() => {
    // Custom dimension 2 - walletname
    googleAnalytics.setDimension(Dimensions.walletName, account ? walletName : 'Not connected')

    // Custom dimension 4 - user id - because ReactGA.set might not be working
    const userId = account ? `"${account}"` : ''
    googleAnalytics.setDimension(Dimensions.userAddress, userId)
    ReactGA.set({ userId })

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account) {
      sendFacebookEvent(PIXEL_EVENTS.CONNECT_WALLET)
      sendLinkedinEvent(PIXEL_EVENTS.CONNECT_WALLET)
      sendTwitterEvent(PIXEL_EVENTS.CONNECT_WALLET)
      sendRedditEvent(PIXEL_EVENTS.CONNECT_WALLET)
      sendPavedEvent(PIXEL_EVENTS.CONNECT_WALLET)
      sendMicrosoftEvent(PIXEL_EVENTS.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount])

  useEffect(() => {
    // Custom dimension 5 - market
    googleAnalytics.setDimension(Dimensions.market, marketDimension)
  }, [marketDimension])

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
      sendFacebookEvent(PIXEL_EVENTS.INIT)
      sendLinkedinEvent(PIXEL_EVENTS.INIT)
      sendTwitterEvent(PIXEL_EVENTS.INIT)
      sendRedditEvent(PIXEL_EVENTS.INIT)
      sendPavedEvent(PIXEL_EVENTS.INIT)
      sendMicrosoftEvent(PIXEL_EVENTS.INIT)

      initiatedPixel = true
    }
  }, [])
}
