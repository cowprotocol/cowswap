import { useCallback } from 'react'
import { PriceImpactDeclineError, tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import OperatorError from '@cow/api/gnosisProtocol/errors/OperatorError'
import { PriceImpact } from 'hooks/usePriceImpact'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { partiallyFillableOverrideAtom } from '@cow/modules/limitOrders/state/partiallyFillableOverride'
import { useAtom } from 'jotai'
import { useConfirmPriceImpactWithoutFee } from '@cow/common/hooks/useConfirmPriceImpactWithoutFee'

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
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const [partiallyFillableOverride, setPartiallyFillableOverride] = useAtom(partiallyFillableOverrideAtom)

  return useCallback(() => {
    if (!tradeContext) return Promise.resolve()

    // Apply partiallyFillable override, if it's set
    tradeContext.postOrderParams.partiallyFillable =
      partiallyFillableOverride ?? tradeContext.postOrderParams.partiallyFillable

    return tradeFlow(tradeContext, priceImpact, settingsState, confirmPriceImpactWithoutFee, callbacks.beforeTrade)
      .then((orderHash) => {
        callbacks.onTradeSuccess?.(orderHash)

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
  }, [
    tradeContext,
    partiallyFillableOverride,
    priceImpact,
    settingsState,
    callbacks,
    updateLimitOrdersState,
    setPartiallyFillableOverride,
  ])
}
