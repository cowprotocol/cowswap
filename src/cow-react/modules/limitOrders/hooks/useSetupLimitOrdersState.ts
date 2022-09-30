import { useLimitOrdersStateFromUrl } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersStateFromUrl'
import {
  getDefaultLimitOrdersState,
  LimitOrdersState,
  useLimitOrdersStateManager,
} from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'

export function useSetupLimitOrdersState() {
  const tradeStateFromUrl = useLimitOrdersStateFromUrl()
  const { state, setState } = useLimitOrdersStateManager()

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
          inputCurrencyId: tradeStateFromUrl.inputCurrencyId,
          outputCurrencyId: tradeStateFromUrl.outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)
    setState(newState)
  }, [setState, state, tradeStateFromUrl, shouldSkipUpdate, chainIdWasChanged])
}
