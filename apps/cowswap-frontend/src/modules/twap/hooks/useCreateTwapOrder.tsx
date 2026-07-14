import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useConfig } from 'wagmi'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useSendBatchTransactions, useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { OrderTabId } from 'entities/routes/routes.atom'
import { Nullish } from 'types'

import { useAdvancedOrdersDerivedState, useUpdateAdvancedOrdersRawState } from 'modules/advancedOrders'
import { uploadAppDataDocOrderbookApi, useAppData } from 'modules/appData'
import { buildTradeWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'
import { emitPostedOrderEvent } from 'modules/orders'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { getCowSoundSend } from 'modules/sounds'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { TradeFlowAnalyticsContext, useTradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useAppSigner } from 'common/hooks/useAppSigner'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrder } from './useTwapOrder'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { DEFAULT_TWAP_EXECUTION } from '../const'
import { createEoaTwapOrder } from '../services/createEoaTwapOrder'
import { getCreateTwapOrderTxs } from '../services/createTwapOrderTxs'
import { extensibleFallbackSetupTxs } from '../services/extensibleFallbackSetupTxs'
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
  const twapOrder = useTwapOrder()
  const addTwapOrderToList = useSetAtom(addTwapOrderToListAtom)
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const isSafeWallet = useIsSafeWallet()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const appSigner = useAppSigner()
  const config = useConfig()

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const sendSafeTransactions = useSendBatchTransactions()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const tradeConfirmActions = useTradeConfirmActions()

  const { priceImpact } = useTradePriceImpact()
  const isBridge = getAreBridgeCurrencies(inputCurrencyAmount?.currency, outputCurrencyAmount?.currency)
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)

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
      if (!isSafeWallet && !isTwapEoaEnabled) {
        return
      }

      if (!chainId || !account) return
      if (!inputCurrencyAmount || !outputCurrencyAmount || !appDataInfo || !twapOrder) return

      const isEoaTwap = !isSafeWallet

      if (isEoaTwap) {
        if (!appSigner) return
      } else if (
        !twapOrderCreationContext ||
        chainId !== twapOrderCreationContext.chainId ||
        !extensibleFallbackContext
      ) {
        return
      }

      const safeTwapOrderCreationContext = twapOrderCreationContext
      const safeExtensibleFallbackContext = extensibleFallbackContext
      const eoaSigner = appSigner

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
        const isWidgetHookPassed = await callWidgetHook(
          WidgetHookEvents.ON_BEFORE_TRADE,
          buildTradeWidgetHookPayload({
            orderType,
            inputAmount: inputCurrencyAmount,
            outputAmount: outputCurrencyAmount,
            recipient: twapOrder.receiver,
            orderKind: OrderKind.SELL,
            chainId,
          }),
        )

        if (!isWidgetHookPassed) {
          return
        }

        const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrder)
        const orderId = getConditionalOrderId(paramsStruct)

        tradeConfirmActions.onSign(pendingTrade)
        tradeFlowAnalytics.placeAdvancedOrder(twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('posted', fallbackHandlerIsNotSet)

        await uploadAppDataDocOrderbookApi({
          appDataKeccak256: appDataInfo.appDataKeccak256,
          fullAppData: appDataInfo.fullAppData,
          chainId,
          env: 'prod', // Since WatchTower creates orders only in PROD env, we should have `prod` here
        })

        let safeTxHashOrSubmissionId: string
        let safeAddressOrCowShedAddress: string
        let orderStatus: TwapOrderStatus

        if (isEoaTwap) {
          if (!eoaSigner) return

          // TODO: Rename to placeEoaTwapOrder
          const { fundingOrderId, proxyAddress } = await createEoaTwapOrder({
            chainId,
            account,
            twapOrder,
            paramsStruct,
            signer: eoaSigner,
            config,
          })

          safeTxHashOrSubmissionId = fundingOrderId
          safeAddressOrCowShedAddress = proxyAddress
          orderStatus = TwapOrderStatus.Pending
        } else {
          if (!safeTwapOrderCreationContext || !safeExtensibleFallbackContext) return

          const fallbackSetupTxs = fallbackHandlerIsNotSet
            ? await extensibleFallbackSetupTxs(safeExtensibleFallbackContext)
            : []

          // TODO: Create a function placeTwapOrder with a similar interface to the one in the branch above
          const createOrderTxs = getCreateTwapOrderTxs(twapOrder, paramsStruct, safeTwapOrderCreationContext)
          safeTxHashOrSubmissionId = await sendSafeTransactions([...fallbackSetupTxs, ...createOrderTxs])
          safeAddressOrCowShedAddress = account
          orderStatus = TwapOrderStatus.WaitSigning
        }

        const orderItem: TwapOrderItem = {
          order: twapOrderToStruct(twapOrder),
          status: orderStatus,
          chainId,
          safeAddress: safeAddressOrCowShedAddress,
          submissionDate: new Date().toISOString(),
          id: orderId,
          executionInfo: { ...DEFAULT_TWAP_EXECUTION },
        }

        addTwapOrderToList(orderItem)

        getCowSoundSend().play()

        emitPostedOrderEvent({
          chainId,
          id: orderId,
          orderCreationHash: safeTxHashOrSubmissionId,
          kind: OrderKind.SELL,
          receiver: twapOrder.receiver,
          inputAmount: twapOrder.sellAmount,
          outputAmount: twapOrder.buyAmount,
          owner: account,
          uiOrderType: orderType,
        })

        sendOrderAnalytics('Place Order', `${orderType}|${twapFlowAnalyticsContext.marketLabel}`)

        updateAdvancedOrdersState({ recipient: null, recipientAddress: null })
        tradeConfirmActions.onSuccess(safeTxHashOrSubmissionId)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('signed', fallbackHandlerIsNotSet)

        // TODO: Clear filters if the new order is not visible before navigating.

        // Navigate to open orders after successful placement once the new order is in the store, otherwise you might
        // be redirected back (to OPEN most likely) by the redirection logic in `observeOrdersUrl()` (`ordersTable.atoms.ts`).
        setTimeout(() => {
          // A freshly placed Safe TWAP order is always in WaitSigning until the Safe/SC owners
          // sign it, while a EOA TWAP order is in Open straight away.
          navigateToOrdersTableTab(isEoaTwap ? OrderTabId.OPEN : OrderTabId.SIGNING)
        })
      } catch (error) {
        console.error('[useCreateTwapOrder] error', error)
        const errorMessage = getErrorMessage(error)
        tradeConfirmActions.onError(errorMessage)
        tradeFlowAnalytics.error(error, errorMessage, twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('rejected', fallbackHandlerIsNotSet)
      }
    },
    [
      isTwapEoaEnabled,
      isSafeWallet,
      appSigner,
      config,
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
      updateAdvancedOrdersState,
      sendOrderAnalytics,
      sendTwapConversionAnalytics,
      tradeFlowAnalytics,
      navigateToOrdersTableTab,
    ],
  )
}
