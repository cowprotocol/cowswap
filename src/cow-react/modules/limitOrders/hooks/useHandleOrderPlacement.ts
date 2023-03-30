import { useCallback } from 'react'
import { PriceImpactDeclineError, tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import OperatorError from '@cow/api/gnosisProtocol/errors/OperatorError'
import { PriceImpact } from 'hooks/usePriceImpact'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'

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
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  return useCallback(() => {
    if (!tradeContext) return Promise.resolve()

    return tradeFlow(tradeContext, priceImpact, settingsState, callbacks.beforeTrade)
      .then((orderHash) => {
        callbacks.onTradeSuccess?.(orderHash)

        updateLimitOrdersState({ recipient: null })
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
  }, [tradeContext, priceImpact, settingsState, callbacks, updateLimitOrdersState])
}
