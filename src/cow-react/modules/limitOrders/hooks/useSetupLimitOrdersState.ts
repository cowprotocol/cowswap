import { useLimitOrdersStateFromUrl } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersStateFromUrl'
import { useAtom } from 'jotai'
import {
  getDefaultLimitOrdersState,
  limitOrdersAtom,
  LimitOrdersState,
} from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useHistory } from 'react-router-dom'
import { parameterizeLimitOrdersRoute } from 'cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { useEffect } from 'react'

export function useSetupLimitOrdersState() {
  const history = useHistory()
  const tradeStateFromUrl = useLimitOrdersStateFromUrl()
  const [state, setState] = useAtom(limitOrdersAtom)

  const chainIdWasChanged = tradeStateFromUrl.chainId !== state.chainId

  const shouldSkipUpdate =
    !chainIdWasChanged &&
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === state.inputCurrencyId?.toLowerCase() &&
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === state.outputCurrencyId?.toLowerCase()

  useEffect(() => {
    if (shouldSkipUpdate) return

    const newState: LimitOrdersState = chainIdWasChanged
      ? getDefaultLimitOrdersState(tradeStateFromUrl.chainId)
      : {
          ...state,
          chainId: tradeStateFromUrl.chainId,
          inputCurrencyId: tradeStateFromUrl.inputCurrencyId || state.inputCurrencyId,
          outputCurrencyId: tradeStateFromUrl.outputCurrencyId || state.outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)
    setState(newState)
    setTimeout(() => {
      history.push(parameterizeLimitOrdersRoute(newState.chainId, newState.inputCurrencyId, newState.outputCurrencyId))
    }, 0)
  }, [history, setState, state, tradeStateFromUrl, shouldSkipUpdate, chainIdWasChanged])
}
