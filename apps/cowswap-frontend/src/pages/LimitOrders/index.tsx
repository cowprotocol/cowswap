import { PAGE_TITLES } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { AppDataUpdater } from 'modules/appData'
import { PageTitle } from 'modules/application/containers/PageTitle'
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
      <PageTitle title={PAGE_TITLES.LIMIT_ORDERS} />
    </>
  )
}
