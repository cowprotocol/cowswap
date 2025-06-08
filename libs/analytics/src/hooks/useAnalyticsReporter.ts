import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'
import { Category } from '../types'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

let initiatedPixel = false
let initiated = false

interface UseAnalyticsReporterProps {
  account: string | undefined
  walletName: string | undefined
  chainId: SupportedChainId | undefined
  cowAnalytics: CowAnalytics
  pixelAnalytics?: PixelAnalytics
  webVitalsAnalytics?: WebVitalsAnalytics
  marketDimension?: string
  injectedWidgetAppId?: string
}

/**
 * Common hook used by all apps to report some basic data to analytics
 * @param props
 */
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function useAnalyticsReporter(props: UseAnalyticsReporterProps) {
  const {
    account,
    walletName,
    chainId,
    cowAnalytics,
    pixelAnalytics,
    webVitalsAnalytics,
    marketDimension,
    injectedWidgetAppId,
  } = props
  const { pathname, search } = useLocation()

  const prevAccount = usePrevious(account)

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
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
        !isMobile ? 'desktop' : 'web3' in window || 'ethereum' in window ? 'mobileWeb3' : 'mobileRegular',
      )
    }

    // Report service worker status
    if (typeof window !== 'undefined') {
      const installed = Boolean(window.navigator.serviceWorker?.controller)
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hit = Boolean((window as any).__isDocumentCached)
      const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'

      cowAnalytics.sendEvent({
        category: Category.SERVICE_WORKER,
        action,
        nonInteraction: true,
      })
    }
  }, [webVitalsAnalytics, cowAnalytics])

  // Set analytics context: chainId
  useEffect(() => {
    if (!chainId) {
      return
    }

    cowAnalytics.setContext(AnalyticsContext.chainId, chainId.toString())
  }, [chainId, cowAnalytics])

  // Set analytics context: user account and wallet name
  useEffect(() => {
    cowAnalytics.setUserAccount(account, account ? walletName : 'Not connected')
    cowAnalytics.setContext(AnalyticsContext.walletName, account ? walletName : 'Not connected')

    // Handle pixel tracking on wallet connection
    if (!prevAccount && account && pixelAnalytics) {
      pixelAnalytics.sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount, pixelAnalytics, cowAnalytics])

  useEffect(() => {
    cowAnalytics.sendPageView(`${pathname}${search}`)
  }, [pathname, search, cowAnalytics])

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

  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension, cowAnalytics])

  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId, cowAnalytics])
}
