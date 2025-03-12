import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics, useSafaryTradeTracking, SafaryTradeType } from '@cowprotocol/analytics'
import { getAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { useNavigateToAllOrdersTable } from 'modules/ordersTable'
import { useCloseReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal/hooks'
import { useTradeFlowAnalytics } from 'modules/trade'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import OperatorError from 'api/cowProtocol/errors/OperatorError'
import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { TradeAmounts } from 'common/types'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

function useAlternativeModalAnalytics() {
  const analytics = useCowAnalytics()

  return useCallback(
    (wasPlaced: boolean) => {
      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action: 'alternative_modal_completion',
        label: wasPlaced ? 'placed' : 'not-placed',
      })
    },
    [analytics],
  )
}

export function useHandleOrderPlacement(
  tradeContext: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): () => Promise<void> {
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()
  const { isEdit: isAlternativeOrderEdit } = useAlternativeOrder() || {}
  const closeReceiptModal = useCloseReceiptModal()
  const navigateToAllOrdersTable = useNavigateToAllOrdersTable()
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  // tx bundling stuff
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)
  const alternativeModalAnalytics = useAlternativeModalAnalytics()
  const analytics = useTradeFlowAnalytics()
  const { account } = useWalletInfo()

  // Get fiat amounts from derived state
  const { inputCurrencyFiatAmount, outputCurrencyFiatAmount } = useLimitOrdersDerivedState()

  const beforePermit = useCallback(async () => {
    if (!tradeContext) return

    const {
      postOrderParams: { inputAmount },
      getCachedPermit,
    } = tradeContext
    const inputCurrency = inputAmount.currency

    const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

    if (cachedPermit) return

    tradeConfirmActions.requestPermitSignature(buildTradeAmounts(tradeContext))
  }, [tradeConfirmActions, tradeContext])

  const beforeTrade = useCallback(() => {
    if (!tradeContext) return

    tradeConfirmActions.onSign(buildTradeAmounts(tradeContext))
  }, [tradeContext, tradeConfirmActions])

  // Extract currency information for Safary tracking
  const inputCurrencyInfo = {
    symbol: tradeContext?.postOrderParams?.inputAmount?.currency?.symbol,
    amount: tradeContext?.postOrderParams?.inputAmount,
    fiatAmount: inputCurrencyFiatAmount ? Number(inputCurrencyFiatAmount.toSignificant(6)) : null,
  }

  const outputCurrencyInfo = {
    symbol: tradeContext?.postOrderParams?.outputAmount?.currency?.symbol,
    amount: tradeContext?.postOrderParams?.outputAmount,
    fiatAmount: outputCurrencyFiatAmount ? Number(outputCurrencyFiatAmount.toSignificant(6)) : null,
  }

  // Get contract address for tracking
  const contractAddress = tradeContext?.postOrderParams?.inputAmount?.currency?.isToken
    ? tradeContext?.postOrderParams?.inputAmount?.currency?.address
    : undefined

  // Enhance trade function with Safary tracking
  const tradeFn = useCallback(async () => {
    if (isSafeBundle) {
      if (!safeBundleFlowContext) throw new Error('safeBundleFlowContext is not set!')

      safeBundleFlowContext.postOrderParams.partiallyFillable =
        partiallyFillableOverride ?? safeBundleFlowContext.postOrderParams.partiallyFillable

      return safeBundleFlow(
        safeBundleFlowContext,
        priceImpact,
        settingsState,
        confirmPriceImpactWithoutFee,
        analytics,
        beforeTrade,
      )
    }

    tradeContext.postOrderParams.partiallyFillable =
      partiallyFillableOverride ?? tradeContext.postOrderParams.partiallyFillable

    return tradeFlow(
      tradeContext,
      priceImpact,
      settingsState,
      analytics,
      confirmPriceImpactWithoutFee,
      beforePermit,
      beforeTrade,
    )
  }, [
    beforePermit,
    beforeTrade,
    confirmPriceImpactWithoutFee,
    isSafeBundle,
    partiallyFillableOverride,
    priceImpact,
    safeBundleFlowContext,
    settingsState,
    tradeContext,
    analytics,
  ])

  // Enhance the trade function with Safary tracking
  const enhancedTradeFn = useSafaryTradeTracking({
    account,
    inputCurrencyInfo,
    outputCurrencyInfo,
    contractAddress,
    tradeType: SafaryTradeType.LIMIT_ORDER,
    tradeFn,
    label: 'limit order',
  })

  return useCallback(() => {
    return enhancedTradeFn()
      .then((orderHash) => {
        tradeConfirmActions.onSuccess(orderHash)

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
        // Reset alternative mode if any
        hideAlternativeOrderModal()
        // Navigate to all orders
        navigateToAllOrdersTable()
        // Close receipt modal
        closeReceiptModal()

        // Analytics event to track alternative modal usage, only if was using alternative modal
        if (isAlternativeOrderEdit !== undefined) {
          alternativeModalAnalytics(isAlternativeOrderEdit)
        }
      })
      .catch((error) => {
        if (error instanceof PriceImpactDeclineError) return

        if (error instanceof OperatorError) {
          tradeConfirmActions.onError(error.message)
        } else {
          tradeConfirmActions.onError(getSwapErrorMessage(error))
        }
      })
  }, [
    enhancedTradeFn,
    tradeConfirmActions,
    updateLimitOrdersState,
    setPartiallyFillableOverride,
    isAlternativeOrderEdit,
    navigateToAllOrdersTable,
    closeReceiptModal,
    hideAlternativeOrderModal,
    alternativeModalAnalytics,
  ])
}

function buildTradeAmounts(tradeContext: TradeFlowContext): TradeAmounts {
  return {
    inputAmount: tradeContext.postOrderParams.inputAmount,
    outputAmount: tradeContext.postOrderParams.outputAmount,
  }
}
