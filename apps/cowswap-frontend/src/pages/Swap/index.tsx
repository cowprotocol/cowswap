import { PAGE_TITLES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Navigate, useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { SwapUpdaters, SwapWidget } from 'modules/swap'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'

export function SwapPage() {
  const params = useParams()

  if (!params.chainId) {
    return <SwapPageRedirect />
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.SWAP} />
      <SwapUpdaters />
      <SwapWidget />
    </>
  )
}

function SwapPageRedirect() {
  const { chainId } = useWalletInfo()
  const location = useLocation()

  if (!chainId) return null

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[SwapPageRedirect] Rendering redirect:', {
      location: location,
      search: location.search,
      hash: location.hash,
      chainId,
    })
  }

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

  const finalSearch = searchParams.toString()
  const redirectTo = { ...location, pathname, search: finalSearch }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[SwapPageRedirect] Redirecting to:', {
      from: location,
      to: redirectTo,
      utmParamsInSearch: Array.from(searchParams.entries()).filter(([key]) => key.startsWith('utm_')),
    })
  }

  return <Navigate to={redirectTo} />
}
