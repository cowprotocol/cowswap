import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId } from 'entities/routes/routes.atom'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSolanaTradeFlowContext } from 'modules/limitOrders/hooks/useSolanaTradeFlowContext'
import { useTradeFlowContext } from 'modules/limitOrders/hooks/useTradeFlowContext'
import { PriceImpactDeclineError, WidgetHookDeclineError } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { useCloseReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal/OrdersReceiptModal.hooks'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'
import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { useLimitOrdersTradeCallback } from './useLimitOrdersTradeCallback'

export interface UseHandleOrderPlacementResult {
  callback: () => Promise<void>
  isTradeContextReady: boolean
  isSafeApprovalBundle: boolean
}

export function useHandleOrderPlacement(
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): UseHandleOrderPlacementResult {
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)
  const tradeContext = useTradeFlowContext()
  const solanaContext = useSolanaTradeFlowContext()
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const hideAlternativeOrderModal = useHideAlternativeOrderModal()
  const { isEdit: isAlternativeOrderEdit } = useAlternativeOrder() || {}
  const closeReceiptModal = useCloseReceiptModal()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const setPartiallyFillableOverride = useSetAtom(partiallyFillableOverrideAtom)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)
  const canUsePermit = Boolean(tradeContext?.allowsOffchainSigning && isSupportedPermitInfo(tradeContext.permitInfo))
  const isSafeApprovalBundle = isSafeBundle && Boolean(tradeContext?.postOrderParams.isSafeWallet) && !canUsePermit
  const alternativeModalAnalytics = useAlternativeModalAnalytics()
  const isSmartContractWallet = useIsSmartContractWallet()

  const isTradeContextReady = isSolana ? !!solanaContext : !!tradeContext

  const tradeFn = useLimitOrdersTradeCallback(priceImpact, settingsState, tradeConfirmActions)

  const callback = useCallback(() => {
    return tradeFn()
      .then((result) => {
        if (!result) {
          return
        }

        // solanaFlow already called tradeConfirmActions.onSuccess with the real order id itself.
        if (typeof result === 'string') {
          tradeConfirmActions.onSuccess(result)
        }

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
        // Reset alternative mode if any
        hideAlternativeOrderModal()
        // Close receipt modal
        closeReceiptModal()

        // TODO: Clear filters if the new order is not visible before navigating.

        // Navigate to open orders after successful placement once the new order is in the store, otherwise you'll be redirected back to OPEN as there would
        // still be no signing orders.
        setTimeout(() => {
          navigateToOrdersTableTab(isSmartContractWallet ? OrderTabId.SIGNING : OrderTabId.OPEN)
        })

        // Analytics event to track alternative modal usage, only if was using alternative modal
        if (isAlternativeOrderEdit !== undefined) {
          alternativeModalAnalytics(isAlternativeOrderEdit)
        }
      })
      .catch((error) => {
        if (error instanceof PriceImpactDeclineError) return
        if (error instanceof WidgetHookDeclineError) {
          tradeConfirmActions.onDismiss()
          return
        }

        if (error instanceof OperatorError) {
          tradeConfirmActions.onError(error.message || error.description)
        } else {
          tradeConfirmActions.onError(getSwapErrorMessage(error, chainId))
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
    isSmartContractWallet,
    chainId,
  ])

  return { callback, isTradeContextReady, isSafeApprovalBundle }
}

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
