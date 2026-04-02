import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { Navigate, useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application'
import { HooksStoreWidget } from 'modules/hooksStore'
import { swapDerivedStateAtom, SwapUpdaters, useSwapDerivedStateToFill } from 'modules/swap'
import { getDefaultTradeRawState, parameterizeTradeRoute } from 'modules/trade'

import { Routes } from 'common/constants/routes'
import { HydrateAtom } from 'common/state/HydrateAtom'

export function HooksPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()
  const swapDerivedStateToFill = useSwapDerivedStateToFill()

  if (!params.chainId) {
    return <HooksPageRedirect />
  }

  return (
    <HydrateAtom atom={swapDerivedStateAtom} state={swapDerivedStateToFill}>
      <PageTitle title={i18n._(PAGE_TITLES.HOOKS)} />
      <SwapUpdaters />
      <HooksStoreWidget />
    </HydrateAtom>
  )
}

function HooksPageRedirect(): ReactNode {
  const { chainId } = useWalletInfo()
  const location = useLocation()

  if (!chainId) return null

  const defaultState = getDefaultTradeRawState(chainId)
  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId
  const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId

  searchParams.delete('inputCurrency')
  searchParams.delete('outputCurrency')
  searchParams.delete('chain')

  const pathname = parameterizeTradeRoute(
    {
      chainId: String(chainId),
      inputCurrencyId: inputCurrencyId ?? undefined,
      outputCurrencyId: outputCurrencyId ?? undefined,
      inputCurrencyAmount: undefined,
      outputCurrencyAmount: undefined,
      orderKind: undefined,
    },
    Routes.HOOKS,
  )

  return <Navigate to={{ ...location, pathname, search: searchParams.toString() }} />
}
