import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { orderAnalytics, twapConversionAnalytics } from '@cowprotocol/analytics'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useSafeAppsSdk, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { updateAdvancedOrdersAtom, useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useAppData, useUploadAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { getCowSoundSend } from 'modules/sounds'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { TradeFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'

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
import { getErrorMessage } from '../utils/parseTwapError'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)
  const addTwapOrderToList = useSetAtom(addTwapOrderToListAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const safeAppsSdk = useSafeAppsSdk()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const updateAdvancedOrdersState = useSetAtom(updateAdvancedOrdersAtom)

  const tradeConfirmActions = useTradeConfirmActions()
  const uploadAppData = useUploadAppData()

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

      const orderType = UiOrderType.TWAP
      const twapFlowAnalyticsContext: TradeFlowAnalyticsContext = {
        account,
        recipient: twapOrder.receiver,
        recipientAddress: twapOrder.receiver,
        marketLabel: [inputCurrencyAmount.currency.symbol, outputCurrencyAmount.currency.symbol].join(','),
        orderType,
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

        getCowSoundSend().play()

        emitPostedOrderEvent({
          chainId,
          id: orderId,
          orderCreationHash: safeTxHash,
          kind: OrderKind.SELL,
          receiver: twapOrder.receiver,
          inputAmount: twapOrder.sellAmount,
          outputAmount: twapOrder.buyAmount,
          owner: account,
          uiOrderType: orderType,
        })

        orderAnalytics('Posted', orderType, 'Presign')

        uploadAppData({ chainId, orderId, appData: appDataInfo })
        updateAdvancedOrdersState({ recipient: null, recipientAddress: null })
        tradeConfirmActions.onSuccess(safeTxHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        twapConversionAnalytics('signed', fallbackHandlerIsNotSet)
      } catch (error) {
        console.error('[useCreateTwapOrder] error', error)
        const errorMessage = getErrorMessage(error)
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
      uploadAppData,
      updateAdvancedOrdersState,
    ]
  )
}
