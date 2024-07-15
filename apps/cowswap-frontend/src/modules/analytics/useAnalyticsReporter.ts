import { useEffect } from 'react'

import { AnalyticsContext, CowAnalytics, PixelAnalytics, WebVitalsAnalytics } from '@cowprotocol/analytics'
import { useAnalyticsReporter } from '@cowprotocol/ui'

import { useInjectedWidgetMetaData } from 'modules/injectedWidget'
import { useGetMarketDimension } from '../../common/hooks/useGetMarketDimension'

interface UseAnalyticsReporterProps {
  cowAnalytics: CowAnalytics
  pixelAnalytics?: PixelAnalytics
  webVitalsAnalytics?: WebVitalsAnalytics
}

/**
 * Hook to report analytics for CowSwap app
 * @param props
 * @returns
 */
export function useAnalyticsReporterCowSwap(props: UseAnalyticsReporterProps) {
  const { cowAnalytics } = props
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

  return useAnalyticsReporter(props)
}
