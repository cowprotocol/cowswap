import React from 'react'

import { Navigate, useLocation, useParams } from 'react-router-dom'
import styled from 'styled-components/macro'

import { WRAPPED_NATIVE_CURRENCY as WETH } from 'legacy/constants/tokens'

import { SwapWidget } from 'modules/swap/containers/SwapWidget'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { useWalletInfo } from 'modules/wallet'

import { Routes } from 'constants/routes'

const Wrapper = styled.div`
  margin-top: 20px;
`

export function WidgetPage() {
  const params = useParams()

  if (!params.chainId) {
    return <WidgetPageRedirect />
  }

  return (
    <Wrapper>
      <SwapWidget />
    </Wrapper>
  )
}

function WidgetPageRedirect() {
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
    { chainId: String(chainId), inputCurrencyId, outputCurrencyId },
    Routes.WIDGET
  )

  return <Navigate to={{ ...location, pathname, search: searchParams.toString() }} />
}
