import { TradeRawState } from 'modules/trade/types/TradeRawState'
import { useSwapState } from 'state/swap/hooks'
import { useAppDispatch } from '@src/legacy/state/hooks'
import { useCallback } from 'react'
import { replaceOnlyTradeRawState, ReplaceOnlyTradeRawStatePayload } from '@src/legacy/state/swap/actions'

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
