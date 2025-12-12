import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import { Routes } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

import { TradeUrlParams } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'

type NavigateToNewOrderCallback = (chainId: SupportedChainId, order?: Order, callback?: Command) => () => void

function getCurrencyId(token: Token | undefined): string {
  if (!token) return ''
  return getIsNativeToken(token.chainId, token.address) ? token.symbol || token.address : token.address
}

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

      const isBridgeOrder = getIsBridgeOrder(order)

      const tradeUrlParam: TradeUrlParams = {
        chainId: String(chainId),
        targetChainId: isBridgeOrder ? String(order?.outputToken.chainId) : undefined,
        inputCurrencyId: getCurrencyId(order?.inputToken),
        inputCurrencyAmount,
        outputCurrencyId: order?.outputToken.address,
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
