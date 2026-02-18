import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { AppDataUpdater } from 'modules/appData'
import { PageTitle } from 'modules/application/containers/PageTitle'
import {
  AlternativeLimitOrderUpdater,
  ExecutionPriceUpdater,
  InitialPriceUpdater,
  LIMIT_ORDER_SLIPPAGE,
  QuoteObserverUpdater,
  SetupLimitOrderAmountsFromUrlUpdater,
  TriggerAppziLimitOrdersSurveyUpdater,
  PromoBannerUpdater,
  limitOrdersDerivedStateAtom,
  useLimitOrdersDerivedStateToFill,
} from 'modules/limitOrders'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'

import { HydrateAtom } from 'common/state/HydrateAtom'

import { AlternativeLimitOrder } from './AlternativeLimitOrder'
import { RegularLimitOrders } from './RegularLimitOrders'

export default function LimitOrderPage(): ReactNode {
  const isAlternative = useIsAlternativeOrderModalVisible()
  const { i18n } = useLingui()

  const limitOrdersDerivedStateToFill = useLimitOrdersDerivedStateToFill()

  return (
    <HydrateAtom atom={limitOrdersDerivedStateAtom} state={limitOrdersDerivedStateToFill}>
      <AppDataUpdater orderClass="limit" slippageBips={percentToBps(LIMIT_ORDER_SLIPPAGE)} />
      <QuoteObserverUpdater />
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
      <PageTitle title={i18n._(PAGE_TITLES.LIMIT_ORDERS)} />
    </HydrateAtom>
  )
}
