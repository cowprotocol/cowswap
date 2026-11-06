import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsAlternativeOrderModalVisible } from 'modules/trade'

import { TradeType, useTradeTypeInfoFromUrl } from 'common/modules/tradeNavigation'

export function useIsPriceChartAvailable(): boolean {
  const { isPriceChartEnabled } = useFeatureFlags()
  const { disablePriceChart } = useInjectedWidgetParams()
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeTypeInfo = useTradeTypeInfoFromUrl()
  const isAlternativeLimitOrder = isAlternativeOrderModalVisible && tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER

  return Boolean(isPriceChartEnabled && !disablePriceChart && !isAlternativeLimitOrder)
}
