import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { AppDataUpdater } from 'modules/appData'
import { PageTitle } from 'modules/application'
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
import { TradeRouteRedirect, useIsAlternativeOrderModalVisible } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

import { AlternativeLimitOrderPage } from './AlternativeLimitOrder.page'
import { RegularLimitOrdersPage } from './RegularLimitOrders.page'

export function LimitOrdersPage(): ReactNode {
  const params = useParams()
  const isAlternative = useIsAlternativeOrderModalVisible()
  const { i18n } = useLingui()

  const limitOrdersDerivedStateToFill = useLimitOrdersDerivedStateToFill()

  if (!params.chainId) {
    return <TradeRouteRedirect route={Routes.LIMIT_ORDERS} />
  }

  return (
    <HydrateAtom atom={limitOrdersDerivedStateAtom} state={limitOrdersDerivedStateToFill}>
      <AppDataUpdater orderClass="limit" slippageBips={percentToBps(LIMIT_ORDER_SLIPPAGE)} />
      <QuoteObserverUpdater />
      <ExecutionPriceUpdater />
      <PromoBannerUpdater />
      {isAlternative ? (
        <>
          <AlternativeLimitOrderUpdater />
          <AlternativeLimitOrderPage />
        </>
      ) : (
        <>
          <InitialPriceUpdater />
          <SetupLimitOrderAmountsFromUrlUpdater />
          <TriggerAppziLimitOrdersSurveyUpdater />
          <RegularLimitOrdersPage />
        </>
      )}
      <PageTitle title={i18n._(PAGE_TITLES.LIMIT_ORDERS)} />
    </HydrateAtom>
  )
}
