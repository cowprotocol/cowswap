import React from 'react'

import { NewSwapWidget } from '@cow/modules/swap/containers/NewSwapWidget'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { SupportedChainId } from 'constants/chains'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { Routes } from '@cow/constants/routes'
import { getDefaultTradeState } from '@cow/modules/trade/types/TradeState'

export function NewSwapPage() {
  return <NewSwapWidget />
}

export function NewSwapPageRedirect({ location }: RouteComponentProps) {
  const chainId = SupportedChainId.MAINNET
  const { inputCurrencyId, outputCurrencyId } = getDefaultTradeState(chainId)

  const pathname = parameterizeTradeRoute(
    {
      chainId: String(chainId),
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
    },
    Routes.SWAP
  )

  return <Redirect to={{ ...location, pathname }} />
}
