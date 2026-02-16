import { usePrevious } from '@cowprotocol/common-hooks'
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

import { CowAnalytics } from '../CowAnalytics'
import { PixelAnalytics } from '../pixels/PixelAnalytics'
import { WebVitalsAnalytics } from '../webVitals/WebVitalsAnalytics'

export {
  getChainContextValue,
  getChainSwitchedEvent,
  shouldTrackChainSwitchedEvent,
} from './useAnalyticsReporter.helpers'

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

  useInitAnalytics(cowAnalytics, webVitalsAnalytics)
  useChainContext(cowAnalytics, chainId)
  useChainSwitchAnalytics({ account, prevAccount, chainId, prevChainId, cowAnalytics })
  useUserContext({ account, walletName, prevAccount, pixelAnalytics, cowAnalytics })
  usePageViewTracking(cowAnalytics, pathname, search)
  useInitPixelTracking(pixelAnalytics)
  useMarketContext(cowAnalytics, marketDimension)
  useInjectedWidgetContext(cowAnalytics, injectedWidgetAppId)
}
