import React from 'react'

import { NewSwapWidget } from '@cow/modules/swap/containers/NewSwapWidget'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { Routes } from '@cow/constants/routes'
import { useWeb3React } from '@web3-react/core'

export function NewSwapPage() {
  return <NewSwapWidget />
}

export function NewSwapPageRedirect({ location }: RouteComponentProps) {
  const { chainId } = useWeb3React()

  if (!chainId) return null

  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || WETH[chainId].symbol
  const outputCurrencyId = searchParams.get('outputCurrency') || undefined

  searchParams.delete('inputCurrency')
  searchParams.delete('outputCurrency')
  searchParams.delete('chain')

  const pathname = parameterizeTradeRoute({ chainId: String(chainId), inputCurrencyId, outputCurrencyId }, Routes.SWAP)

  return <Redirect to={{ ...location, pathname, search: searchParams.toString() }} />
}
