import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { twapConversionAnalytics } from 'legacy/components/analytics/events/twapEvents'
import store from 'legacy/state'
import { dispatchPresignedOrderPosted } from 'legacy/state/orders/middleware/updateOrderPopup'
import { getCowSoundSend } from 'legacy/utils/sound'
import { getOrderSubmitSummary } from 'legacy/utils/trade'

import { updateAdvancedOrdersAtom, useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useAppData } from 'modules/appData'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { SwapFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { useWalletInfo } from 'modules/wallet'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { createTwapOrderTxs } from '../services/createTwapOrderTxs'
import { extensibleFallbackSetupTxs } from '../services/extensibleFallbackSetupTxs'
import { twapOrderAtom } from '../state/twapOrderAtom'
import { addTwapOrderToListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { parseTwapErrorMessage } from '../utils/parseTwapError'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)
  const addTwapOrderToList = useSetAtom(addTwapOrderToListAtom)

  const { inputCurrencyAmount, outputCurrencyAmount, recipient } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const safeAppsSdk = useSafeAppsSdk()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const updateAdvancedOrdersState = useSetAtom(updateAdvancedOrdersAtom)

  const tradeConfirmActions = useTradeConfirmActions()

  const { priceImpact } = useTradePriceImpact()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()

  return useCallback(
    async (fallbackHandlerIsNotSet: boolean) => {
      if (!chainId || !account) return
      if (
        !inputCurrencyAmount ||
        !outputCurrencyAmount ||
        !twapOrderCreationContext ||
        !extensibleFallbackContext ||
        !safeAppsSdk ||
        !appDataInfo ||
        !twapOrder
      )
        return

      const isPriceImpactConfirmed = await confirmPriceImpactWithoutFee(priceImpact)

      if (!isPriceImpactConfirmed) {
        return
      }

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

      try {
        const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrder)
        const orderId = getConditionalOrderId(paramsStruct)

        tradeConfirmActions.onSign(pendingTrade)
        tradeFlowAnalytics.placeAdvancedOrder(twapFlowAnalyticsContext)
        twapConversionAnalytics('posted', fallbackHandlerIsNotSet)

        const fallbackSetupTxs = fallbackHandlerIsNotSet
          ? await extensibleFallbackSetupTxs(extensibleFallbackContext)
          : []
        const createOrderTxs = createTwapOrderTxs(twapOrder, paramsStruct, twapOrderCreationContext)
        const { safeTxHash } = await safeAppsSdk.txs.send({ txs: [...fallbackSetupTxs, ...createOrderTxs] })

        const orderItem: TwapOrderItem = {
          order: twapOrderToStruct(twapOrder),
          status: TwapOrderStatus.WaitSigning,
          chainId,
          safeAddress: account,
          submissionDate: new Date().toISOString(),
          id: orderId,
          executionInfo: { confirmedPartsCount: 0, info: DEFAULT_TWAP_EXECUTION_INFO },
        }

        addTwapOrderToList(orderItem)

        const summary = getOrderSubmitSummary({
          recipient: recipient || account,
          kind: OrderKind.SELL,
          recipientAddressOrName: recipient || account,
          account,
          inputAmount: twapOrder.sellAmount,
          outputAmount: twapOrder.buyAmount,
          feeAmount: undefined,
        })
        getCowSoundSend().play()
        dispatchPresignedOrderPosted(store, safeTxHash, summary, OrderClass.LIMIT, 'composable-order')

        updateAdvancedOrdersState({ recipient: null, recipientAddress: null })
        tradeConfirmActions.onSuccess(safeTxHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        twapConversionAnalytics('signed', fallbackHandlerIsNotSet)
      } catch (error) {
        const errorMessage = parseTwapErrorMessage(error)
        tradeConfirmActions.onError(errorMessage)
        tradeFlowAnalytics.error(error, errorMessage, twapFlowAnalyticsContext)
        twapConversionAnalytics('rejected', fallbackHandlerIsNotSet)
      }
    },
    [
      chainId,
      account,
      inputCurrencyAmount,
      outputCurrencyAmount,
      twapOrderCreationContext,
      extensibleFallbackContext,
      safeAppsSdk,
      appDataInfo,
      twapOrder,
      confirmPriceImpactWithoutFee,
      priceImpact,
      tradeConfirmActions,
      addTwapOrderToList,
      recipient,
      updateAdvancedOrdersState,
    ]
  )
}
