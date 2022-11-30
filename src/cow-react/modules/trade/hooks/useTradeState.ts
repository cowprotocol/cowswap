import { TradeType, useTradeTypeInfo } from './useTradeTypeInfo'
import { useCallback, useMemo } from 'react'
import { TradeState } from '@cow/modules/trade/types/TradeState'
import { replaceSwapState, ReplaceSwapStatePayload } from 'state/swap/actions'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitOrdersAtom, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useSwapState } from 'state/swap/hooks'
import { useAppDispatch } from 'state/hooks'

export function useSwapTradeState(): TradeState {
  const swapState = useSwapState()

  return {
    chainId: swapState.chainId,
    recipient: swapState.recipient,
    inputCurrencyId: swapState.INPUT.currencyId || null,
    outputCurrencyId: swapState.OUTPUT.currencyId || null,
  }
}

export function useLimitOrdersTradeState(): TradeState {
  return useAtomValue(limitOrdersAtom)
}

// TODO: maybe better to return empty object instead of null
export function useTradeState(): { state: TradeState; updateState: (state: TradeState) => void } | null {
  const dispatch = useAppDispatch()
  const tradeTypeInfo = useTradeTypeInfo()

  const limitOrdersState = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  const swapState = useSwapState()
  const swapTradeState = useSwapTradeState()
  const updateSwapState = useCallback(
    (state: TradeState) => {
      const newState: ReplaceSwapStatePayload = {
        typedValue: swapState.typedValue,
        independentField: swapState.independentField,
        chainId: state.chainId,
        recipient: state.recipient,
        inputCurrencyId: state.inputCurrencyId || undefined,
        outputCurrencyId: state.outputCurrencyId || undefined,
      }

      dispatch(replaceSwapState(newState))
    },
    [swapState, dispatch]
  )

  return useMemo(() => {
    if (!tradeTypeInfo) return null

    if (tradeTypeInfo.tradeType === TradeType.SWAP) {
      return {
        state: swapTradeState,
        updateState: updateSwapState,
      }
    }

    return {
      state: limitOrdersState,
      updateState: updateLimitOrdersState,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(tradeTypeInfo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(limitOrdersState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(swapTradeState),
    updateSwapState,
    updateLimitOrdersState,
  ])
}
