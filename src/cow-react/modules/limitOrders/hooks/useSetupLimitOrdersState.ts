import { useLimitOrdersStateFromUrl } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersStateFromUrl'
import {
  getDefaultLimitOrdersState,
  LimitOrdersState,
  useLimitOrdersStateManager,
} from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'

export function useSetupLimitOrdersState() {
  const tradeStateFromUrl = useLimitOrdersStateFromUrl()
  const { state, setState, navigate } = useLimitOrdersStateManager()

  const chainIdWasChanged = tradeStateFromUrl.chainId !== state.chainId

  const shouldSkipUpdate =
    !chainIdWasChanged &&
    (!tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === state.recipient) &&
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === state.inputCurrencyId?.toLowerCase() &&
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === state.outputCurrencyId?.toLowerCase()

  useEffect(() => {
    if (shouldSkipUpdate) return

    const newState: LimitOrdersState = chainIdWasChanged
      ? getDefaultLimitOrdersState(tradeStateFromUrl.chainId)
      : {
          ...state,
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || state.recipient,
          inputCurrencyId: tradeStateFromUrl.inputCurrencyId || state.inputCurrencyId,
          outputCurrencyId: tradeStateFromUrl.outputCurrencyId || state.outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)
    setState(newState)
    setTimeout(() => {
      navigate(newState.chainId, newState.inputCurrencyId, newState.outputCurrencyId)
    }, 0)
  }, [navigate, setState, state, tradeStateFromUrl, shouldSkipUpdate, chainIdWasChanged])
}
