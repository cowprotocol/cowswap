import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import {
  useChainContext,
  useChainSwitchAnalytics,
  useInitAnalytics,
  useInjectedWidgetContext,
  useInitPixelTracking,
  useMarketContext,
  usePageViewTracking,
  useUserContext,
} from './useAnalyticsReporter.effects'

import { useCowAnalytics } from '../context/CowAnalyticsContext'
import { initPixelAnalytics } from '../pixels/initPixelAnalytics'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

export {
  getChainContextValue,
  getChainSwitchedEvent,
  shouldEmitChainSwitchedEventForSameWallet,
} from './useAnalyticsReporter.helpers'

interface UseAnalyticsReporterProps {
  account: string | undefined
  walletName: string | undefined
  chainId: SupportedChainId | undefined
  marketDimension?: string
  injectedWidgetAppId?: string
}

/**
 * Common hook used by all apps to report some basic data to analytics
 * @param props
 */
export function useAnalyticsReporter({
  account,
  walletName,
  chainId,
  marketDimension,
  injectedWidgetAppId,
}: UseAnalyticsReporterProps): void {
  const cowAnalytics = useCowAnalytics()
  const webVitalsAnalytics = useMemo(
    () => (isInjectedWidget() ? undefined : new WebVitalsAnalytics(cowAnalytics)),
    [cowAnalytics],
  )
  const pixelAnalytics = useMemo(() => (isInjectedWidget() ? undefined : initPixelAnalytics()), [])
  const { pathname, search } = useLocation()

  const prevAccount = usePrevious(account)
  const prevChainId = usePrevious(chainId)

  useInitAnalytics(cowAnalytics, webVitalsAnalytics)
  useChainContext(cowAnalytics, chainId)
  useChainSwitchAnalytics({ account, prevAccount, chainId, prevChainId, cowAnalytics })
  useUserContext({ account, walletName, prevAccount, pixelAnalytics, cowAnalytics })
  usePageViewTracking(cowAnalytics, pathname, search)
  useInitPixelTracking(pixelAnalytics)
  useMarketContext(cowAnalytics, marketDimension)
  useInjectedWidgetContext(cowAnalytics, injectedWidgetAppId)
}
