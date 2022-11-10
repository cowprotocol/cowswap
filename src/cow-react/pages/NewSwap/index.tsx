import React from 'react'

import { NewSwapWidget } from '@cow/modules/swap/containers/NewSwapWidget'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { Routes } from '@cow/constants/routes'
import { getDefaultTradeState } from '@cow/modules/trade/types/TradeState'
import { useWeb3React } from '@web3-react/core'

export function NewSwapPage() {
  return <NewSwapWidget />
}

export function NewSwapPageRedirect({ location }: RouteComponentProps) {
  const { chainId } = useWeb3React()

  if (!chainId) return null

  const defaultState = getDefaultTradeState(chainId)
  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || undefined
  const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

  searchParams.delete('inputCurrency')
  searchParams.delete('outputCurrency')

  const pathname = parameterizeTradeRoute({ chainId: String(chainId), inputCurrencyId, outputCurrencyId }, Routes.SWAP)

  return <Redirect to={{ ...location, pathname, search: searchParams.toString() }} />
}
