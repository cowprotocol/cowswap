import { useCallback } from 'react'

import { useAppDispatch } from 'legacy/state/hooks'
import { replaceOnlyTradeRawState, ReplaceOnlyTradeRawStatePayload } from 'legacy/state/swap/actions'
import { useSwapState } from 'legacy/state/swap/hooks'

import { TradeRawState } from 'modules/trade/types/TradeRawState'

export function useSwapRawState(): TradeRawState {
  const swapState = useSwapState()

  return {
    chainId: swapState.chainId,
    recipient: swapState.recipient,
    inputCurrencyId: swapState.INPUT.currencyId || null,
    outputCurrencyId: swapState.OUTPUT.currencyId || null,
  }
}
export function useUpdateSwapRawState(): (update: Partial<TradeRawState>) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (state: Partial<TradeRawState>) => {
      const newState: ReplaceOnlyTradeRawStatePayload = {
        chainId: state.chainId ?? null,
        recipient: state.recipient ?? null,
        inputCurrencyId: state.inputCurrencyId || undefined,
        outputCurrencyId: state.outputCurrencyId || undefined,
      }

      dispatch(replaceOnlyTradeRawState(newState))
    },
    [dispatch]
  )
}
