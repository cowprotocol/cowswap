import { useEffect } from 'react'

import { isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  ChainSwitchGuardInput,
  getChainContextValue,
  getChainSwitchedEvent,
  shouldEmitChainSwitchedEventForSameWallet,
} from './useAnalyticsReporter.helpers'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'
import { Category } from '../types'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

// Prevent duplicate initialization when React strict mode or re-renders
// cause effects to run multiple times. WeakSet allows GC when the instance
// is dereferenced.
const initializedAnalyticsInstances = new WeakSet<CowAnalytics>()
const initializedPixelInstances = new WeakSet<PixelAnalytics>()

type BrowserType = 'desktop' | 'mobileWeb3' | 'mobileRegular'

interface CachedDocumentWindow extends Window {
  __isDocumentCached?: boolean
}

interface ChainSwitchEffectParams extends ChainSwitchGuardInput {
  cowAnalytics: CowAnalytics
}

export function useChainContext(cowAnalytics: CowAnalytics, chainId: SupportedChainId | undefined): void {
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.chainId, getChainContextValue(chainId))
  }, [chainId, cowAnalytics])
}

export function useChainSwitchAnalytics({
  account,
  prevAccount,
  chainId,
  prevChainId,
  cowAnalytics,
}: ChainSwitchEffectParams): void {
  useEffect(() => {
    // Reused in contexts where chain can change without a connected wallet.
    // Emit only wallet chain-switches: same account before/after and a real chainId change.
    const chainSwitchInput = { account, prevAccount, chainId, prevChainId }

    if (!shouldEmitChainSwitchedEventForSameWallet(chainSwitchInput)) {
      return
    }

    cowAnalytics.sendEvent(getChainSwitchedEvent(chainSwitchInput.prevChainId, chainSwitchInput.chainId))
  }, [account, prevAccount, chainId, prevChainId, cowAnalytics])
}

export function useInitAnalytics(cowAnalytics: CowAnalytics, webVitalsAnalytics: WebVitalsAnalytics | undefined): void {
  useEffect(() => {
    reportInitAnalytics(cowAnalytics, webVitalsAnalytics)
  }, [cowAnalytics, webVitalsAnalytics])
}

export function useInitPixelTracking(pixelAnalytics: PixelAnalytics | undefined): void {
  useEffect(() => {
    reportInitPixel(pixelAnalytics)
  }, [pixelAnalytics])
}

export function useInjectedWidgetContext(cowAnalytics: CowAnalytics, injectedWidgetAppId: string | undefined): void {
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId, cowAnalytics])
}

export function useMarketContext(cowAnalytics: CowAnalytics, marketDimension: string | undefined): void {
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension, cowAnalytics])
}

export function usePageViewTracking(cowAnalytics: CowAnalytics, pathname: string, search: string): void {
  useEffect(() => {
    cowAnalytics.sendPageView(`${pathname}${search}`)
  }, [pathname, search, cowAnalytics])
}

export { useUserContext } from './useUserContext'

function getBrowserType(win: Window): BrowserType {
  return !isMobile ? 'desktop' : 'web3' in win || 'ethereum' in win ? 'mobileWeb3' : 'mobileRegular'
}

function getServiceWorkerAction(win: Window): 'Cache hit' | 'Cache miss' | 'Not installed' {
  const installed = Boolean(win.navigator.serviceWorker?.controller)
  const hit = Boolean((win as CachedDocumentWindow).__isDocumentCached)
  return installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'
}

function reportInitAnalytics(cowAnalytics: CowAnalytics, webVitalsAnalytics: WebVitalsAnalytics | undefined): void {
  if (typeof window === 'undefined') {
    return
  }

  if (initializedAnalyticsInstances.has(cowAnalytics)) {
    return
  }

  initializedAnalyticsInstances.add(cowAnalytics)
  webVitalsAnalytics?.reportWebVitals()

  cowAnalytics.setContext(AnalyticsContext.customBrowserType, getBrowserType(window))
  cowAnalytics.sendEvent({
    category: Category.SERVICE_WORKER,
    action: getServiceWorkerAction(window),
    nonInteraction: true,
  })
}

function reportInitPixel(pixelAnalytics?: PixelAnalytics): void {
  if (!pixelAnalytics || initializedPixelInstances.has(pixelAnalytics)) {
    return
  }

  pixelAnalytics.sendAllPixels(PixelEvent.INIT)
  initializedPixelInstances.add(pixelAnalytics)
}
