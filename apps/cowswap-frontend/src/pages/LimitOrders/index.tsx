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
} from 'modules/limitOrders'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'

import { AlternativeLimitOrder } from './AlternativeLimitOrder'
import { RegularLimitOrders } from './RegularLimitOrders'

export default function LimitOrderPage() {
  const isAlternative = useIsAlternativeOrderModalVisible()

  return (
    <>
      <AppDataUpdater orderClass="limit" slippage={LIMIT_ORDER_SLIPPAGE} />
      <QuoteObserverUpdater />
      <FillLimitOrdersDerivedStateUpdater />
      <ExecutionPriceUpdater />
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
