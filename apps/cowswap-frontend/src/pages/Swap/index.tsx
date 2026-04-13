import { ReactNode } from 'react'

import { PAGE_TITLES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { Navigate, useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application'
import { PriceChart } from 'modules/priceChart'
import {
  swapDerivedStateAtom,
  SwapUpdaters,
  SwapWidget,
  useSwapDerivedState,
  useSwapDerivedStateToFill,
} from 'modules/swap'
import {
  getDefaultTradeRawState,
  PageWrapper,
  parameterizeTradeRoute,
  PrimaryWrapper,
  SecondaryWrapper,
} from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

export function SwapPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()
  const swapDerivedStateToFill = useSwapDerivedStateToFill()

  if (!params.chainId) {
    return <SwapPageRedirect />
  }

  return (
    <HydrateAtom atom={swapDerivedStateAtom} state={swapDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.SWAP)} />

      <SwapUpdaters />
      <SwapPageContent />
    </HydrateAtom>
  )
}

function SwapPageRedirect(): ReactNode {
  const { chainId } = useWalletInfo()
  const location = useLocation()

  if (!chainId) return null

  const defaultState = getDefaultTradeRawState(chainId)
  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || WETH[chainId]?.symbol
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
    Routes.SWAP,
  )

  return <Navigate to={{ ...location, pathname, search: searchParams.toString() }} />
}

function SwapPageContent(): ReactNode {
  const { inputCurrency, isUnlocked, outputCurrency } = useSwapDerivedState()
  const shouldShowChart = Boolean(inputCurrency && outputCurrency)

  return (
    <PageWrapper hideOrdersTable={!shouldShowChart} isUnlocked={isUnlocked || shouldShowChart}>
      <PrimaryWrapper>
        <SwapWidget />
      </PrimaryWrapper>

      {shouldShowChart ? (
        <SecondaryWrapper className="trade-orders-table">
          <PriceChart inputCurrency={inputCurrency} outputCurrency={outputCurrency} />
        </SecondaryWrapper>
      ) : null}
    </PageWrapper>
  )
}
