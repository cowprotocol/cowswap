import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeConfirmActions } from 'modules/trade'
import { SwapFlowAnalyticsContext } from 'modules/trade/utils/analytics'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { useWalletInfo } from 'modules/wallet'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { useSafeAppsSdk } from '../../wallet/web3-react/hooks/useSafeAppsSdk'
import { createTwapOrderTxs } from '../services/createTwapOrderTxs'
import { extensibleFallbackSetupTxs } from '../services/extensibleFallbackSetupTxs'
import { twapOrderAtom } from '../state/twapOrderAtom'
import { addTwapOrderToListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderStatus } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)
  const addTwapOrderToList = useUpdateAtom(addTwapOrderToListAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const safeAppsSdk = useSafeAppsSdk()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const tradeConfirmActions = useTradeConfirmActions()

  return useCallback(
    async (fallbackHandlerIsNotSet: boolean) => {
      if (!chainId || !account) return
      if (
        !inputCurrencyAmount ||
        !outputCurrencyAmount ||
        !twapOrderCreationContext ||
        !extensibleFallbackContext ||
        !safeAppsSdk ||
        !twapOrder
      )
        return

      const pendingTrade = {
        inputAmount: inputCurrencyAmount,
        outputAmount: outputCurrencyAmount,
      }

      const twapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
        account,
        recipient: twapOrder.receiver,
        recipientAddress: twapOrder.receiver,
        marketLabel: [inputCurrencyAmount.currency.symbol, outputCurrencyAmount.currency.symbol].join(','),
        orderClass: 'TWAP',
      }

      const startTime = Math.round((Date.now() + ms`1m`) / 1000) // Now + 1 min
      const twapOrderWithStartTime = { ...twapOrder, startTime }
      const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrderWithStartTime)
      const orderId = getConditionalOrderId(paramsStruct)

      tradeFlowAnalytics.placeAdvancedOrder(twapFlowAnalyticsContext)
      tradeConfirmActions.onSign(pendingTrade)

      try {
        const fallbackSetupTxs = fallbackHandlerIsNotSet
          ? await extensibleFallbackSetupTxs(extensibleFallbackContext)
          : []
        const createOrderTxs = createTwapOrderTxs(twapOrderWithStartTime, paramsStruct, twapOrderCreationContext)
        const { safeTxHash } = await safeAppsSdk.txs.send({ txs: [...fallbackSetupTxs, ...createOrderTxs] })

        addTwapOrderToList({
          order: twapOrderToStruct(twapOrder),
          status: TwapOrderStatus.WaitSigning,
          chainId,
          safeAddress: account,
          submissionDate: new Date().toISOString(),
          id: orderId,
        })

        tradeConfirmActions.onSuccess(safeTxHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
      } catch (error) {
        tradeConfirmActions.onError(error.message || error)
        tradeFlowAnalytics.error(error, error.message, twapFlowAnalyticsContext)
      }
    },
    [
      chainId,
      account,
      inputCurrencyAmount,
      outputCurrencyAmount,
      twapOrder,
      tradeConfirmActions,
      twapOrderCreationContext,
      extensibleFallbackContext,
      addTwapOrderToList,
      safeAppsSdk,
    ]
  )
}
