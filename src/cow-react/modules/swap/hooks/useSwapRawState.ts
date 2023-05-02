import { TradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { useSwapState } from 'state/swap/hooks'
import { useAppDispatch } from '@src/state/hooks'
import { useCallback } from 'react'
import { replaceSwapState, ReplaceSwapStatePayload } from '@src/state/swap/actions'

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
  const swapState = useSwapState()
  const dispatch = useAppDispatch()

  return useCallback(
    (state: Partial<TradeRawState>) => {
      const newState: ReplaceSwapStatePayload = {
        typedValue: swapState.typedValue,
        independentField: swapState.independentField,
        chainId: state.chainId || swapState.chainId,
        recipient: typeof state.recipient === 'undefined' ? swapState.recipient : state.recipient,
        inputCurrencyId: state.inputCurrencyId || undefined,
        outputCurrencyId: state.outputCurrencyId || undefined,
      }

      dispatch(replaceSwapState(newState))
    },
    [swapState, dispatch]
  )
}
