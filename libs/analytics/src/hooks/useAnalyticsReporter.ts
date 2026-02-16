import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'
import { Category, GtmEvent } from '../types'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

let initiatedPixel = false
let initiated = false
const NOT_CONNECTED_WALLET_NAME = 'Not connected'

type BrowserType = 'desktop' | 'mobileWeb3' | 'mobileRegular'

interface CachedDocumentWindow extends Window {
  __isDocumentCached?: boolean
}

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

function getBrowserType(win: Window): BrowserType {
  return !isMobile ? 'desktop' : 'web3' in win || 'ethereum' in win ? 'mobileWeb3' : 'mobileRegular'
}

function getServiceWorkerAction(win: Window): 'Cache hit' | 'Cache miss' | 'Not installed' {
  const installed = Boolean(win.navigator.serviceWorker?.controller)
  const hit = Boolean((win as CachedDocumentWindow).__isDocumentCached)
  return installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'
}

function reportInitAnalytics({
  cowAnalytics,
  webVitalsAnalytics,
}: Pick<UseAnalyticsReporterProps, 'cowAnalytics' | 'webVitalsAnalytics'>): void {
  if (initiated) {
    return
  }
  initiated = true

  webVitalsAnalytics?.reportWebVitals()

  if (typeof window === 'undefined') {
    return
  }

  cowAnalytics.setContext(AnalyticsContext.customBrowserType, getBrowserType(window))
  cowAnalytics.sendEvent({
    category: Category.SERVICE_WORKER,
    action: getServiceWorkerAction(window),
    nonInteraction: true,
  })
}

function reportInitPixel(pixelAnalytics?: PixelAnalytics): void {
  if (initiatedPixel) {
    return
  }

  pixelAnalytics?.sendAllPixels(PixelEvent.INIT)
  initiatedPixel = true
}

/**
 * Common hook used by all apps to report some basic data to analytics
 * @param props
 */
export function useAnalyticsReporter(props: UseAnalyticsReporterProps): void {
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
  const prevChainId = usePrevious(chainId)

  useEffect(() => {
    reportInitAnalytics({ cowAnalytics, webVitalsAnalytics })
  }, [webVitalsAnalytics, cowAnalytics])

  // Set analytics context: chainId
  useEffect(() => {
    if (!chainId) {
      return
    }

    cowAnalytics.setContext(AnalyticsContext.chainId, chainId.toString())
  }, [chainId, cowAnalytics])

  // Track chain switching only when wallet is connected
  useEffect(() => {
    // This hook is reused in Explorer, where `chainId` changes but no wallet is connected (`account` is undefined).
    // We only want wallet chain-switch analytics, so require both current and previous account.
    // Also skip no-op updates where chain did not actually change.
    if (!account || !prevAccount || !chainId || !prevChainId || chainId === prevChainId) {
      return
    }

    cowAnalytics.sendEvent({
      category: 'Wallet',
      action: 'chain_switched',
      previousChainId: prevChainId.toString(),
      newChainId: chainId.toString(),
    } as GtmEvent<'Wallet'>)
  }, [account, prevAccount, chainId, prevChainId, cowAnalytics])

  // Set analytics context: user account and wallet name
  useEffect(() => {
    const walletNameForContext = account ? walletName : NOT_CONNECTED_WALLET_NAME

    cowAnalytics.setUserAccount(account, walletNameForContext)
    cowAnalytics.setContext(AnalyticsContext.walletName, walletNameForContext)

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
    reportInitPixel(pixelAnalytics)
  }, [pixelAnalytics])

  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension, cowAnalytics])

  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId, cowAnalytics])
}
