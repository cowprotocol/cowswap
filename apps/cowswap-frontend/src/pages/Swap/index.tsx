import { PAGE_TITLES, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Navigate, useLocation, useParams } from 'react-router'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { SwapUpdaters, SwapWidget } from 'modules/swap'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SwapPageRedirect() {
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
