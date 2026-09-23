import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useConfig } from 'wagmi'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { getAddress } from '@cowprotocol/common-utils'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId } from 'entities/routes/routes.atom'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { buildTradeWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { useSolanaTradeFlowContext } from 'modules/limitOrders/hooks/useSolanaTradeFlowContext'
import { useTradeFlowContext } from 'modules/limitOrders/hooks/useTradeFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { PriceImpactDeclineError, TradeFlowContext, WidgetHookDeclineError } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { useCloseReceiptModal } from 'modules/ordersTable/containers/OrdersReceiptModal/OrdersReceiptModal.hooks'
import { useTradeFlowAnalytics } from 'modules/trade'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { useAlternativeOrder, useHideAlternativeOrderModal } from 'modules/trade/state/alternativeOrder'
import { solanaFlow } from 'modules/tradeFlow'

import { OperatorError } from 'api/cowProtocol/errors/OperatorError'
import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { TradeAmounts } from 'common/types'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

export interface UseHandleOrderPlacementResult {
  callback: () => Promise<void>
  isTradeContextReady: boolean
  isSafeApprovalBundle: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function, complexity
export function useHandleOrderPlacement(
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): UseHandleOrderPlacementResult {
  const config = useConfig()
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)
  const tradeContext = useTradeFlowContext()
  const solanaContext = useSolanaTradeFlowContext()
  const isBridge = getAreBridgeCurrencies(
    tradeContext?.postOrderParams.inputAmount.currency,
    tradeContext?.postOrderParams.outputAmount.currency,
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
  const canUsePermit = Boolean(tradeContext?.allowsOffchainSigning && isSupportedPermitInfo(tradeContext.permitInfo))
  // Temporary: keep limit-order bundles Safe-only until EIP-5792 order lifecycle tracking lands.
  // Solana has no Safe-wallet/bundling concept — same precedence swap's own dispatcher gives it.
  const shouldUseSafeBundle =
    !isSolana && isSafeBundle && Boolean(tradeContext?.postOrderParams.isSafeWallet) && !canUsePermit
  const isSafeApprovalBundle = isSafeBundle && Boolean(tradeContext?.postOrderParams.isSafeWallet) && !canUsePermit
  const alternativeModalAnalytics = useAlternativeModalAnalytics()
  const analytics = useTradeFlowAnalytics()
  const { t } = useLingui()
  const isSmartContractWallet = useIsSmartContractWallet()

  const isTradeContextReady = isSolana ? !!solanaContext : !!tradeContext

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

  // eslint-disable-next-line complexity
  const tradeFn = useCallback(async (): Promise<string | true | undefined> => {
    if (isSolana) {
      if (!solanaContext) return undefined

      const isWidgetHookPassed = await callWidgetHook(
        WidgetHookEvents.ON_BEFORE_TRADE,
        buildTradeWidgetHookPayload({
          orderType: UiOrderType.LIMIT,
          inputAmount: solanaContext.context.inputAmount,
          outputAmount: solanaContext.context.outputAmount,
          recipient: solanaContext.context.receiver,
          orderKind: solanaContext.context.orderKind,
          chainId: solanaContext.context.chainId,
          validTo: solanaContext.context.validTo,
        }),
      )

      if (!isWidgetHookPassed) return undefined

      // solanaFlow calls tradeConfirmActions.onSign/.onSuccess/.onError and closeModals() itself.
      const placed = await solanaFlow(solanaContext, analytics)
      return placed === true ? true : undefined
    }

    if (!tradeContext) return undefined

    const isWidgetHookPassed = await callWidgetHook(
      WidgetHookEvents.ON_BEFORE_TRADE,
      buildTradeWidgetHookPayload({
        orderType: UiOrderType.LIMIT,
        inputAmount: tradeContext.postOrderParams.inputAmount,
        outputAmount: tradeContext.postOrderParams.outputAmount,
        recipient: tradeContext.postOrderParams.recipient,
        orderKind: tradeContext.postOrderParams.kind,
        chainId: tradeContext.chainId,
        validTo: tradeContext.quoteState
          ? calculateLimitOrdersDeadline(settingsState, tradeContext.quoteState)
          : undefined,
      }),
    )

    if (!isWidgetHookPassed) {
      return undefined
    }

    const partiallyFillableState =
      typeof partiallyFillableOverride === 'boolean' ? { partiallyFillable: partiallyFillableOverride } : null

    if (shouldUseSafeBundle) {
      if (!safeBundleFlowContext) throw new Error(t`safeBundleFlowContext is not set!`)

      return safeBundleFlow({
        params: {
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
        config,
      })
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
    isSolana,
    solanaContext,
    analytics,
    config,
    shouldUseSafeBundle,
    tradeContext,
    partiallyFillableOverride,
    priceImpact,
    settingsState,
    confirmPriceImpactWithoutFee,
    beforePermit,
    beforeTrade,
    safeBundleFlowContext,
    t,
  ])

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

function buildTradeAmounts(tradeContext: TradeFlowContext): TradeAmounts {
  return {
    inputAmount: tradeContext.postOrderParams.inputAmount,
    outputAmount: tradeContext.postOrderParams.outputAmount,
  }
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
