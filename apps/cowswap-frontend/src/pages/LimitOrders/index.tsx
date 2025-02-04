import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import {
  AlternativeLimitOrderUpdater,
  ExecutionPriceUpdater,
  FillLimitOrdersDerivedStateUpdater,
  InitialPriceUpdater,
  LIMIT_ORDER_SLIPPAGE,
  QuoteObserverUpdater,
  SetupLimitOrderAmountsFromUrlUpdater,
  TriggerAppziLimitOrdersSurveyUpdater,
  PromoBannerUpdater,
} from 'modules/limitOrders'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'

import { AlternativeLimitOrder } from './AlternativeLimitOrder'
import { RegularLimitOrders } from './RegularLimitOrders'
export default function LimitOrderPage() {
  const isAlternative = useIsAlternativeOrderModalVisible()

  return (
    <>
      <AppDataUpdater orderClass="limit" slippageBips={percentToBps(LIMIT_ORDER_SLIPPAGE)} />
      <QuoteObserverUpdater />
      <FillLimitOrdersDerivedStateUpdater />
      <ExecutionPriceUpdater />
      <PromoBannerUpdater />
      {isAlternative ? (
        <>
          <AlternativeLimitOrderUpdater />
          <AlternativeLimitOrder />
        </>
      ) : (
        <>
          <InitialPriceUpdater />
          <SetupLimitOrderAmountsFromUrlUpdater />
          <TriggerAppziLimitOrdersSurveyUpdater />
          <RegularLimitOrders />
        </>
      )}
    </>
  )
}
