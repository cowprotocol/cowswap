import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsPriceChartAvailable(): boolean {
  const { isPriceChartEnabled } = useFeatureFlags()
  const { disablePriceChart } = useInjectedWidgetParams()

  return Boolean(isPriceChartEnabled && !disablePriceChart)
}
