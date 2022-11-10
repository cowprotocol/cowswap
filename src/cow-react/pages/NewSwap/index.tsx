import React from 'react'

import { NewSwapWidget } from '@cow/modules/swap/containers/NewSwapWidget'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { SupportedChainId } from 'constants/chains'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { Routes } from '@cow/constants/routes'

export function NewSwapPage() {
  return <NewSwapWidget />
}

export function NewSwapPageRedirect({ location }: RouteComponentProps) {
  const chainId = SupportedChainId.MAINNET
  const inputCurrencyId = WETH[chainId].symbol

  const pathname = parameterizeTradeRoute(
    { chainId: String(chainId), inputCurrencyId, outputCurrencyId: undefined },
    Routes.SWAP
  )

  return <Redirect to={{ ...location, pathname }} />
}
