import { useEffect } from 'react'

import { AnalyticsContext } from '@cowprotocol/analytics'
import { useAnalyticsReporter } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { cowAnalytics, pixelAnalytics, webVitalsAnalytics } from 'modules/analytics'
import { useInjectedWidgetMetaData } from 'modules/injectedWidget'

import { useGetMarketDimension } from '../../common/hooks/useGetMarketDimension'

/**
 * Hook to report analytics for CowSwap app
 * @param props
 * @returns
 */
export function useAnalyticsReporterCowSwap() {
  const { chainId, account } = useWalletInfo()
  const { walletName } = useWalletDetails()
  const marketDimension = useGetMarketDimension()

  const injectedWidgetMetaData = useInjectedWidgetMetaData()
  const injectedWidgetAppId = injectedWidgetMetaData?.appCode

  // Set analytics context: injected widget app id
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.injectedWidgetAppId, injectedWidgetAppId)
  }, [injectedWidgetAppId])

  // Set analytics context: market
  useEffect(() => {
    cowAnalytics.setContext(AnalyticsContext.market, marketDimension || undefined)
  }, [marketDimension])

  return useAnalyticsReporter({ account, chainId, walletName, cowAnalytics, pixelAnalytics, webVitalsAnalytics })
}
