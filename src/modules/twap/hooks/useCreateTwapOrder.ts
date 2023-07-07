import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { twapConversionAnalytics } from 'legacy/components/analytics/events/twapEvents'
import store from 'legacy/state'
import { dispatchPresignedOrderPosted } from 'legacy/state/orders/middleware/updateOrderPopup'
import { getCowSoundSend } from 'legacy/utils/sound'
import { getOrderSubmitSummary } from 'legacy/utils/trade'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useAppData, useUploadAppData } from 'modules/appData'
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
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)
  const addTwapOrderToList = useUpdateAtom(addTwapOrderToListAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const safeAppsSdk = useSafeAppsSdk()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const uploadAppData = useUploadAppData()
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

      const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrder)
      const orderId = getConditionalOrderId(paramsStruct)

      tradeConfirmActions.onSign(pendingTrade)
      tradeFlowAnalytics.placeAdvancedOrder(twapFlowAnalyticsContext)
      twapConversionAnalytics('posted', fallbackHandlerIsNotSet)

      try {
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
          executionInfo: DEFAULT_TWAP_EXECUTION_INFO,
        }

        addTwapOrderToList(orderItem)

        const summary = getOrderSubmitSummary({
          recipient: twapOrder.receiver,
          kind: OrderKind.SELL,
          recipientAddressOrName: null,
          account,
          inputAmount: twapOrder.sellAmount,
          outputAmount: twapOrder.buyAmount,
          feeAmount: undefined,
        })
        getCowSoundSend().play()
        dispatchPresignedOrderPosted(store, orderId, summary, OrderClass.LIMIT)

        uploadAppData({ chainId, orderId, appData: appDataInfo })
        tradeConfirmActions.onSuccess(safeTxHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        twapConversionAnalytics('signed', fallbackHandlerIsNotSet)
      } catch (error) {
        tradeConfirmActions.onError(error.message || error)
        tradeFlowAnalytics.error(error, error.message, twapFlowAnalyticsContext)
        twapConversionAnalytics('rejected', fallbackHandlerIsNotSet)
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
      confirmPriceImpactWithoutFee,
      priceImpact,
      uploadAppData,
      appDataInfo,
    ]
  )
}
