
import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Navigate, useLocation, useParams } from 'react-router-dom'

import { SwapUpdaters, SwapWidget } from 'modules/swap'
import { PartialApprovalBanner } from 'modules/swap/pure/banners/PartialApprovalBanner'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { useOpenSettingsTab } from 'modules/tradeWidgetAddons/state/settingsTabState'

import { Routes } from 'common/constants/routes'

export function SwapPage() {
  const params = useParams()
  const openSettings = useOpenSettingsTab()

  if (!params.chainId) {
    return <SwapPageRedirect />
  }

  return (
    <>
      <SwapUpdaters />
      <SwapWidget topContent={<PartialApprovalBanner openSettings={openSettings} />} />
    </>
  )
}

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
