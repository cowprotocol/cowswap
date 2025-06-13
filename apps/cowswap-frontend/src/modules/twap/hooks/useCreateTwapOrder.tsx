import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useSendBatchTransactions, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useAdvancedOrdersDerivedState, useUpdateAdvancedOrdersRawState } from 'modules/advancedOrders'
import { useAppData, useUploadAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { useNavigateToAllOrdersTable } from 'modules/ordersTable/hooks/useNavigateToAllOrdersTable'
import { getCowSoundSend } from 'modules/sounds'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { TradeFlowAnalyticsContext, useTradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
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

interface TwapAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TWAP
  action: string
  label: string
}

interface TwapConversionEvent extends TwapAnalyticsEvent {
  action: 'Conversion'
  label: `${string}|${'no-handler' | 'handler-set'}`
}

interface TwapOrderEvent extends TwapAnalyticsEvent {
  action: 'Place Order'
  label: `${UiOrderType.TWAP}|${string}`
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)
  const addTwapOrderToList = useSetAtom(addTwapOrderToListAtom)
  const navigateToAllOrdersTable = useNavigateToAllOrdersTable()

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const sendSafeTransactions = useSendBatchTransactions()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const tradeConfirmActions = useTradeConfirmActions()
  const uploadAppData = useUploadAppData()

  const { priceImpact } = useTradePriceImpact()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()

  const analytics = useCowAnalytics()
  const tradeFlowAnalytics = useTradeFlowAnalytics()

  const sendOrderAnalytics = useCallback(
    (action: string, context: string) => {
      const analyticsEvent: TwapOrderEvent = {
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Place Order',
        label: `${UiOrderType.TWAP}|${context}`,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const sendTwapConversionAnalytics = useCallback(
    (status: string, fallbackHandlerIsNotSet: boolean) => {
      const analyticsEvent: TwapConversionEvent = {
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Conversion',
        label: `${status}|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  return useCallback(
    // TODO: Break down this large function into smaller functions
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line max-lines-per-function, complexity
    async (fallbackHandlerIsNotSet: boolean) => {
      if (!chainId || !account || chainId !== twapOrderCreationContext?.chainId) return
      if (
        !inputCurrencyAmount ||
        !outputCurrencyAmount ||
        !twapOrderCreationContext ||
        !extensibleFallbackContext ||
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
        sendTwapConversionAnalytics('posted', fallbackHandlerIsNotSet)

        const fallbackSetupTxs = fallbackHandlerIsNotSet
          ? await extensibleFallbackSetupTxs(extensibleFallbackContext)
          : []

        // upload the app data here, as application might need it to decode the order info before it is being signed
        uploadAppData({ chainId, orderId, appData: appDataInfo })
        const createOrderTxs = createTwapOrderTxs(twapOrder, paramsStruct, twapOrderCreationContext)
        const safeTxHash = await sendSafeTransactions([...fallbackSetupTxs, ...createOrderTxs])

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

        sendOrderAnalytics('Place Order', `${orderType}|${twapFlowAnalyticsContext.marketLabel}`)

        updateAdvancedOrdersState({ recipient: null, recipientAddress: null })
        tradeConfirmActions.onSuccess(safeTxHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('signed', fallbackHandlerIsNotSet)

        // Navigate to all orders after successful placement
        navigateToAllOrdersTable()
      } catch (error) {
        console.error('[useCreateTwapOrder] error', error)
        const errorMessage = getErrorMessage(error)
        tradeConfirmActions.onError(errorMessage)
        tradeFlowAnalytics.error(error, errorMessage, twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('rejected', fallbackHandlerIsNotSet)
      }
    },
    [
      chainId,
      account,
      inputCurrencyAmount,
      outputCurrencyAmount,
      twapOrderCreationContext,
      extensibleFallbackContext,
      sendSafeTransactions,
      appDataInfo,
      twapOrder,
      confirmPriceImpactWithoutFee,
      priceImpact,
      tradeConfirmActions,
      addTwapOrderToList,
      uploadAppData,
      updateAdvancedOrdersState,
      sendOrderAnalytics,
      sendTwapConversionAnalytics,
      tradeFlowAnalytics,
      navigateToAllOrdersTable,
    ],
  )
}
