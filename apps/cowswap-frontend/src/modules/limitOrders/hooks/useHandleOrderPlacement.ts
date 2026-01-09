import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { getAddress } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { OrderTabId, useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { useCloseReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal/hooks'
import { useTradeFlowAnalytics } from 'modules/trade'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import OperatorError from 'api/cowProtocol/errors/OperatorError'
import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { TradeAmounts } from 'common/types'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

function useAlternativeModalAnalytics(): (wasPlaced: boolean) => void {
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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useHandleOrderPlacement(
  tradeContext: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): () => Promise<void> {
  const isBridge = getAreBridgeCurrencies(
    tradeContext.postOrderParams.inputAmount.currency,
    tradeContext.postOrderParams.outputAmount.currency,
  )
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()
  const { isEdit: isAlternativeOrderEdit } = useAlternativeOrder() || {}
  const closeReceiptModal = useCloseReceiptModal()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  // tx bundling stuff
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)
  const alternativeModalAnalytics = useAlternativeModalAnalytics()
  const analytics = useTradeFlowAnalytics()
  const { t } = useLingui()

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

  const tradeFn = useCallback(async () => {
    const partiallyFillableState =
      typeof partiallyFillableOverride === 'boolean' ? { partiallyFillable: partiallyFillableOverride } : null

    if (isSafeBundle) {
      if (!safeBundleFlowContext) throw new Error(t`safeBundleFlowContext is not set!`)

      return safeBundleFlow(
        {
          ...safeBundleFlowContext,
          postOrderParams: {
            ...safeBundleFlowContext.postOrderParams,
            ...partiallyFillableState,
          },
        },
        priceImpact,
        settingsState,
        confirmPriceImpactWithoutFee,
        analytics,
        beforeTrade,
      )
    }

    return tradeFlow(
      {
        ...tradeContext,
        postOrderParams: {
          ...tradeContext.postOrderParams,
          ...partiallyFillableState,
        },
      },
      priceImpact,
      settingsState,
      analytics,
      confirmPriceImpactWithoutFee,
      beforePermit,
      beforeTrade,
    )
  }, [
    isSafeBundle,
    tradeContext,
    partiallyFillableOverride,
    priceImpact,
    settingsState,
    analytics,
    confirmPriceImpactWithoutFee,
    beforePermit,
    beforeTrade,
    safeBundleFlowContext,
    t,
  ])

  return useCallback(() => {
    return tradeFn()
      .then((orderHash) => {
        tradeConfirmActions.onSuccess(orderHash)

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
        // Reset alternative mode if any
        hideAlternativeOrderModal()
        // Navigate to all orders
        navigateToOrdersTableTab(OrderTabId.all)
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
          tradeConfirmActions.onError(error.message || error.description)
        } else {
          tradeConfirmActions.onError(getSwapErrorMessage(error))
        }
      })
  }, [
    tradeFn,
    tradeConfirmActions,
    updateLimitOrdersState,
    setPartiallyFillableOverride,
    isAlternativeOrderEdit,
    navigateToOrdersTableTab,
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
