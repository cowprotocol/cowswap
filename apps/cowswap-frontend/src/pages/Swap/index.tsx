import { ReactNode } from 'react'

import { PAGE_TITLES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { Navigate, useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { useResetOrdersTableFilters } from 'modules/ordersTable/hooks/useResetOrdersTableFilters'
import { SwapUpdaters, SwapWidget } from 'modules/swap'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'

export function SwapPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()

  useResetOrdersTableFilters({
    syncWithUrl: false,
  })

  if (!params.chainId) {
    return <SwapPageRedirect />
  }

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.SWAP)} />
      <SwapUpdaters />
      <SwapWidget />
    </>
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
