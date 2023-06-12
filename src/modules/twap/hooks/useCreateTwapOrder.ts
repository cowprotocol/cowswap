import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeConfirmActions } from 'modules/trade'
import { useWalletInfo } from 'modules/wallet'

import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { settleTwapOrder } from '../services/settleTwapOrder'
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

  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)

  const tradeConfirmActions = useTradeConfirmActions()

  return useCallback(async () => {
    if (!chainId || !account) return
    if (!inputCurrencyAmount || !outputCurrencyAmount || !twapOrderCreationContext || !twapOrder) return

    const pendingTrade = {
      inputAmount: inputCurrencyAmount,
      outputAmount: outputCurrencyAmount,
    }

    const startTime = Math.round((Date.now() + ms`1m`) / 1000) // Now + 1 min
    const twapOrderWithStartTime = { ...twapOrder, startTime }
    const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrderWithStartTime)
    const orderId = getConditionalOrderId(paramsStruct)

    tradeConfirmActions.onSign(pendingTrade)

    try {
      const { safeTxHash } = await settleTwapOrder(twapOrderWithStartTime, paramsStruct, twapOrderCreationContext)

      addTwapOrderToList({
        order: twapOrderToStruct(twapOrder),
        status: TwapOrderStatus.WaitSigning,
        chainId,
        safeAddress: account,
        submissionDate: new Date().toISOString(),
        id: orderId,
      })

      tradeConfirmActions.onSuccess(safeTxHash)
    } catch (error) {
      tradeConfirmActions.onError(error.message || error)
    }
  }, [
    chainId,
    account,
    inputCurrencyAmount,
    outputCurrencyAmount,
    twapOrder,
    tradeConfirmActions,
    twapOrderCreationContext,
    addTwapOrderToList,
  ])
}
