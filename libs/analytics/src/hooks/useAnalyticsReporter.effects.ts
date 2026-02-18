import { useEffect } from 'react'

import { isMobile } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  ChainSwitchGuardInput,
  getChainContextValue,
  getChainSwitchedEvent,
  shouldTrackChainSwitchedEvent,
} from './useAnalyticsReporter.helpers'

import { AnalyticsContext, CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics, PixelEvent } from '../pixels/PixelAnalytics'
import { Category } from '../types'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

const initializedAnalyticsInstances = new WeakSet<CowAnalytics>()
const initializedPixelInstances = new WeakSet<PixelAnalytics>()
const NOT_CONNECTED_WALLET_NAME = 'Not connected'

type BrowserType = 'desktop' | 'mobileWeb3' | 'mobileRegular'

interface CachedDocumentWindow extends Window {
  __isDocumentCached?: boolean
}

interface ChainSwitchEffectParams extends ChainSwitchGuardInput {
  cowAnalytics: CowAnalytics
}

interface UserContextEffectParams {
  account: string | undefined
  walletName: string | undefined
  prevAccount: string | null | undefined
  pixelAnalytics?: PixelAnalytics
  cowAnalytics: CowAnalytics
}

function getBrowserType(win: Window): BrowserType {
  return !isMobile ? 'desktop' : 'web3' in win || 'ethereum' in win ? 'mobileWeb3' : 'mobileRegular'
}

function getServiceWorkerAction(win: Window): 'Cache hit' | 'Cache miss' | 'Not installed' {
  const installed = Boolean(win.navigator.serviceWorker?.controller)
  const hit = Boolean((win as CachedDocumentWindow).__isDocumentCached)
  return installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'
}

function reportInitAnalytics(cowAnalytics: CowAnalytics, webVitalsAnalytics: WebVitalsAnalytics | undefined): void {
  if (initializedAnalyticsInstances.has(cowAnalytics)) {
    return
  }

  initializedAnalyticsInstances.add(cowAnalytics)
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
  if (!pixelAnalytics || initializedPixelInstances.has(pixelAnalytics)) {
    return
  }

  pixelAnalytics.sendAllPixels(PixelEvent.INIT)
  initializedPixelInstances.add(pixelAnalytics)
}

export function useInitAnalytics(cowAnalytics: CowAnalytics, webVitalsAnalytics: WebVitalsAnalytics | undefined): void {
  useEffect(() => {
    reportInitAnalytics(cowAnalytics, webVitalsAnalytics)
  }, [cowAnalytics, webVitalsAnalytics])
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
    // This hook is reused in Explorer, where `chainId` changes but no wallet is connected (`account` is undefined).
    // We only want wallet chain-switch analytics, so require the same wallet to be connected before/after chain change.
    // Also skip no-op updates where chain did not actually change.
    const chainSwitchInput = { account, prevAccount, chainId, prevChainId }

    if (!shouldTrackChainSwitchedEvent(chainSwitchInput)) {
      return
    }

    cowAnalytics.sendEvent(getChainSwitchedEvent(chainSwitchInput.prevChainId, chainSwitchInput.chainId))
  }, [account, prevAccount, chainId, prevChainId, cowAnalytics])
}

export function useUserContext({
  account,
  walletName,
  prevAccount,
  pixelAnalytics,
  cowAnalytics,
}: UserContextEffectParams): void {
  useEffect(() => {
    const walletNameForContext = account ? walletName : NOT_CONNECTED_WALLET_NAME

    cowAnalytics.setUserAccount(account, walletNameForContext)
    cowAnalytics.setContext(AnalyticsContext.walletName, walletNameForContext)

    if (!prevAccount && account && pixelAnalytics) {
      pixelAnalytics.sendAllPixels(PixelEvent.CONNECT_WALLET)
    }
  }, [account, walletName, prevAccount, pixelAnalytics, cowAnalytics])
}

export function usePageViewTracking(cowAnalytics: CowAnalytics, pathname: string, search: string): void {
  useEffect(() => {
    cowAnalytics.sendPageView(`${pathname}${search}`)
  }, [pathname, search, cowAnalytics])
}

export function useInitPixelTracking(pixelAnalytics: PixelAnalytics | undefined): void {
  useEffect(() => {
    reportInitPixel(pixelAnalytics)
  }, [pixelAnalytics])
}

export function useMarketContext(cowAnalytics: CowAnalytics, marketDimension: string | undefined): void {
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension, cowAnalytics])
}

export function useInjectedWidgetContext(cowAnalytics: CowAnalytics, injectedWidgetAppId: string | undefined): void {
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId, cowAnalytics])
}
