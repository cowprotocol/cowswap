import { useCallback } from 'react'

import { useAppDispatch } from 'legacy/state/hooks'
import { replaceOnlyTradeRawState, ReplaceOnlyTradeRawStatePayload } from 'legacy/state/swap/actions'

import { ExtendedTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'

import { useSwapState } from './useSwapState'

export function useSwapRawState(): TradeRawState {
  const swapState = useSwapState()

  return {
    chainId: swapState.chainId,
    recipient: swapState.recipient,
    recipientAddress: swapState.recipientAddress,
    inputCurrencyId: swapState.INPUT.currencyId || null,
    outputCurrencyId: swapState.OUTPUT.currencyId || null,
  }
}
export function useUpdateSwapRawState(): (update: Partial<ExtendedTradeRawState>) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (state: Partial<ExtendedTradeRawState>) => {
      const newState: ReplaceOnlyTradeRawStatePayload = {
        chainId: state.chainId ?? null,
        recipient: state.recipient ?? null,
        recipientAddress: state.recipientAddress ?? null,
        inputCurrencyId: state.inputCurrencyId || undefined,
        outputCurrencyId: state.outputCurrencyId || undefined,
        inputCurrencyAmount: state.inputCurrencyAmount ?? undefined,
        outputCurrencyAmount: state.outputCurrencyAmount ?? undefined,
      }

      dispatch(replaceOnlyTradeRawState(newState))
    },
    [dispatch]
  )
}
