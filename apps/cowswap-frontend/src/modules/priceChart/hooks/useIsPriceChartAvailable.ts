import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsAlternativeOrderModalVisible } from 'modules/trade'

export function useIsPriceChartAvailable(): boolean {
  const { isPriceChartEnabled } = useFeatureFlags()
  const { disablePriceChart } = useInjectedWidgetParams()
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()

  return Boolean(isPriceChartEnabled && !disablePriceChart && !isAlternativeOrderModalVisible)
}
