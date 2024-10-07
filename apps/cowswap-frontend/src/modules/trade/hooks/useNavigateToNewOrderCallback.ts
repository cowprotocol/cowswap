import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { TradeUrlParams } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'

type NavigateToNewOrderCallback = (chainId: SupportedChainId, order?: Order, callback?: Command) => () => void

export function useNavigateToNewOrderCallback(): NavigateToNewOrderCallback {
  const navigate = useNavigate()

  return useCallback(
    (chainId: SupportedChainId, order?: Order, callback?: Command) => {
      const inputCurrencyAmount = order
        ? CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount).toFixed(order.inputToken.decimals)
        : ''
      const outputCurrencyAmount = order
        ? CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount).toFixed(order.outputToken.decimals)
        : ''

      const tradeUrlParam: TradeUrlParams = {
        chainId: String(chainId),
        inputCurrencyId: order?.sellToken,
        inputCurrencyAmount,
        outputCurrencyId: order?.buyToken,
        outputCurrencyAmount,
        orderKind: order?.kind,
      }
      const swapLink = parameterizeTradeRoute(tradeUrlParam, Routes.SWAP, true)

      return () => {
        navigate(swapLink)
        callback?.()
      }
    },
    [navigate],
  )
}
