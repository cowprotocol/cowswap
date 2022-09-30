import { useLimitOrdersStateFromUrl } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersStateFromUrl'
import {
  getDefaultLimitOrdersState,
  limitOrdersAtom,
  LimitOrdersState,
  updateLimitOrdersAtom,
} from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useLimitOrdersNavigate } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersNavigate'

export function useSetupLimitOrdersState() {
  const tradeStateFromUrl = useLimitOrdersStateFromUrl()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const limitOrdersNavigate = useLimitOrdersNavigate()

  const chainIdWasChanged = tradeStateFromUrl.chainId !== state.chainId

  const shouldSkipUpdate =
    !chainIdWasChanged &&
    (!tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === state.recipient) &&
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === state.inputCurrencyId?.toLowerCase() &&
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === state.outputCurrencyId?.toLowerCase()

  useEffect(() => {
    if (shouldSkipUpdate) return

    const newState: Partial<LimitOrdersState> = chainIdWasChanged
      ? getDefaultLimitOrdersState(tradeStateFromUrl.chainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || state.recipient,
          inputCurrencyId: tradeStateFromUrl.inputCurrencyId,
          outputCurrencyId: tradeStateFromUrl.outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)
    updateLimitOrdersState(newState)
    if (chainIdWasChanged) {
      limitOrdersNavigate(
        tradeStateFromUrl.chainId,
        newState.inputCurrencyId || null,
        newState.outputCurrencyId || null
      )
    }
  }, [
    limitOrdersNavigate,
    updateLimitOrdersState,
    state.recipient,
    tradeStateFromUrl,
    shouldSkipUpdate,
    chainIdWasChanged,
  ])
}
