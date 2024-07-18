import { useEffect } from 'react'

import { AnalyticsContext, PixelEvent, CowAnalytics, PixelAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { usePrevious } from '@cowprotocol/common-hooks'
import { isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router-dom'

import { serviceWorkerLoad } from './events'

let initiatedPixel = false
let initiated = false

interface UseAnalyticsReporterProps {
  account: string | undefined
  walletName: string | undefined
  chainId: SupportedChainId | undefined
  cowAnalytics: CowAnalytics
  pixelAnalytics?: PixelAnalytics
  webVitalsAnalytics?: WebVitalsAnalytics
}

/**
 * Common hook used by all apps to report some basic data to analytics
 * @param props
 */
export function useAnalyticsReporter(props: UseAnalyticsReporterProps) {
  const { account, walletName, chainId, cowAnalytics, pixelAnalytics, webVitalsAnalytics } = props
  const { pathname, search } = useLocation()

  const prevAccount = usePrevious(account)

  useEffect(() => {
    if (initiated) {
      return
    }
    initiated = true

    // Report Web Vitals
    webVitalsAnalytics?.reportWebVitals()

    // Set browser type
    if (typeof window !== 'undefined') {
      cowAnalytics.setContext(
        AnalyticsContext.customBrowserType,
        !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular'
      )
    }

    // Report service worker status
    if (typeof window !== 'undefined') {
      const installed = Boolean(window.navigator.serviceWorker?.controller)
      const hit = Boolean((window as any).__isDocumentCached)
      serviceWorkerLoad(cowAnalytics, installed, hit)
    }
  }, [webVitalsAnalytics])

  // Set analytics context: chainId
  useEffect(() => {
    if (!chainId) {
      return
    }

    cowAnalytics.setContext(AnalyticsContext.chainId, chainId.toString())
  }, [chainId])

  // Set analytics context: user account and wallet name
  useEffect(() => {
    cowAnalytics.setUserAccount(account)
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
