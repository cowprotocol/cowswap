import { ReactNode, useEffect } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useLocation, useParams } from 'react-router'

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
import { getDefaultTradeRawState, parameterizeTradeRoute, useIsAlternativeOrderModalVisible } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'
import { HydrateAtom } from 'common/state/HydrateAtom'

import { AlternativeLimitOrderPage } from './AlternativeLimitOrder.page'
import { RegularLimitOrdersPage } from './RegularLimitOrders.page'

function LimitOrdersPageRedirect(): ReactNode {
  const { chainId } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const defaultState = getDefaultTradeRawState(chainId)
    const searchParams = new URLSearchParams(location.search)
    const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || undefined
    const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

    searchParams.delete('inputCurrency')
    searchParams.delete('outputCurrency')
    searchParams.delete('chain')

    const pathname = parameterizeTradeRoute(
      {
        chainId: String(chainId),
        inputCurrencyId,
        outputCurrencyId,
        inputCurrencyAmount: undefined,
        outputCurrencyAmount: undefined,
        orderKind: undefined,
      },
      Routes.LIMIT_ORDERS,
    )

    navigate({ pathname, search: searchParams.toString() }, { replace: true })
  }, [chainId, location.search, navigate])

  return null
}

export function LimitOrdersPage(): ReactNode {
  const params = useParams()
  const isAlternative = useIsAlternativeOrderModalVisible()
  const { i18n } = useLingui()

  const limitOrdersDerivedStateToFill = useLimitOrdersDerivedStateToFill()

  if (!params.chainId) {
    return <LimitOrdersPageRedirect />
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
