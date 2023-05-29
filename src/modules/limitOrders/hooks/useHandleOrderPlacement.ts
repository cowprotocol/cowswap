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

import OperatorError from 'api/gnosisProtocol/errors/OperatorError'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

interface HandleTradeCallback {
  beforeTrade(): void

  onDismissConfirmation(): void

  onTradeSuccess(hash: string | null): void

  onError(error: string): void
  finally(): void
}

export function useHandleOrderPlacement(
  tradeContext: TradeFlowContext | null,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  callbacks: Partial<HandleTradeCallback>
): () => Promise<void> {
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)
  // tx bundling stuff
  const safeBundleFlowContext = useSafeBundleFlowContext(tradeContext)
  const isSafeBundle = useIsSafeApprovalBundle(tradeContext?.postOrderParams.inputAmount)

  const tradeFn = useCallback(async () => {
    if (isSafeBundle && safeBundleFlowContext) {
      safeBundleFlowContext.postOrderParams.partiallyFillable =
        partiallyFillableOverride ?? safeBundleFlowContext.postOrderParams.partiallyFillable

      return safeBundleFlow(
        safeBundleFlowContext,
        priceImpact,
        settingsState,
        confirmPriceImpactWithoutFee,
        callbacks.beforeTrade
      )
    } else if (!isSafeBundle && tradeContext) {
      tradeContext.postOrderParams.partiallyFillable =
        partiallyFillableOverride ?? tradeContext.postOrderParams.partiallyFillable

      return tradeFlow(tradeContext, priceImpact, settingsState, confirmPriceImpactWithoutFee, callbacks.beforeTrade)
    }

    return
  }, [
    callbacks.beforeTrade,
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
        callbacks.onTradeSuccess?.(orderHash || null)

        updateLimitOrdersState({ recipient: null })
        // Reset override after successful order placement
        setPartiallyFillableOverride(undefined)
      })
      .catch((error: Error) => {
        if (error instanceof PriceImpactDeclineError) return

        callbacks.onDismissConfirmation?.()

        if (error instanceof OperatorError) {
          callbacks.onError?.(error.message)
        }
      })
      .finally(() => {
        callbacks.finally?.()
      })
  }, [tradeFn, callbacks, updateLimitOrdersState, setPartiallyFillableOverride])
}
