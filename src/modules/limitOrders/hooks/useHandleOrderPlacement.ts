import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useIsSafeApprovalBundle } from 'modules/limitOrders/hooks/useIsSafeApprovalBundle'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { updateLimitOrdersRawStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeConfirmActions } from 'modules/trade/hooks/useTradeConfirmActions'
import { TradeAmounts } from 'modules/trade/types/TradeAmounts'

import OperatorError from 'api/gnosisProtocol/errors/OperatorError'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

export function useHandleOrderPlacement(
  tradeContext: TradeFlowContext | null,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions
): () => Promise<void> {
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  // tx bundling stuff
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)

  const beforeTrade = useCallback(() => {
    if (!tradeContext) return

    const tradeAmounts: TradeAmounts = {
      inputAmount: tradeContext.postOrderParams.inputAmount,
      outputAmount: tradeContext.postOrderParams.outputAmount,
    }

    tradeConfirmActions.onSign(tradeAmounts)
  }, [tradeContext, tradeConfirmActions])

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
        beforeTrade
      )
    }

    if (!tradeContext) throw new Error('tradeContext is not set!')

    tradeContext.postOrderParams.partiallyFillable =
      partiallyFillableOverride ?? tradeContext.postOrderParams.partiallyFillable

    return tradeFlow(tradeContext, priceImpact, settingsState, confirmPriceImpactWithoutFee, beforeTrade)
  }, [
    beforeTrade,
    confirmPriceImpactWithoutFee,
    isSafeBundle,
    partiallyFillableOverride,
    priceImpact,
    safeBundleFlowContext,
    settingsState,
    tradeContext,
  ])

  return useCallback(() => {
    return tradeFn()
      .then((orderHash) => {
        tradeConfirmActions.onSuccess(orderHash)

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
      })
      .catch((error: Error) => {
        if (error instanceof PriceImpactDeclineError) return

        if (error instanceof OperatorError) {
          tradeConfirmActions.onError(error.message)
        } else {
          tradeConfirmActions.onDismiss()
        }
      })
  }, [tradeFn, tradeConfirmActions, updateLimitOrdersState, setPartiallyFillableOverride])
}
