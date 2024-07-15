import { useEffect } from 'react'

import { AnalyticsContext, PixelEvent, CowAnalytics, PixelAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router-dom'

let initiatedPixel = false

interface UseAnalyticsReporterProps {
  cowAnalytics: CowAnalytics
  pixelAnalytics?: PixelAnalytics
  webVitalsAnalytics?: WebVitalsAnalytics
}

/**
 * Common hook used by all apps to report some basic data to analytics
 * @param props
 */
export function useAnalyticsReporter(props: UseAnalyticsReporterProps) {
  const { cowAnalytics, pixelAnalytics, webVitalsAnalytics } = props
  const { pathname, search } = useLocation()

  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const prevAccount = usePrevious(account)

  // Report Web Vitals
  useEffect(() => {
    webVitalsAnalytics?.reportWebVitals()
  }, [webVitalsAnalytics])

  // Set analytics context: chainId
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.chainId, chainId.toString())
  }, [chainId])

  // Set analytics context: user account and wallet name
  useEffect(() => {
    cowAnalytics.setUserAccount(AnalyticsContext.userAddress)
    cowAnalytics.setContext(AnalyticsContext.walletName, account ? walletName : 'Not connected')

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account && pixelAnalytics) {
      pixelAnalytics.sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount, pixelAnalytics])

  useEffect(() => {
    cowAnalytics.sendPageView(`${pathname}${search}`)
  }, [pathname, search])

  // Handle initiate pixel tracking
  useEffect(() => {
    if (!initiatedPixel) {
      if (pixelAnalytics) {
        // Sent all pixels
        pixelAnalytics.sendAllPixels(PixelEvent.INIT)
      }

      initiatedPixel = true
    }
  }, [pixelAnalytics])
}
