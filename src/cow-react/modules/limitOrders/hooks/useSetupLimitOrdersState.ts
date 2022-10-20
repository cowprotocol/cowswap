import { useLimitOrdersStateFromUrl } from '@cow/modules/limitOrders/hooks/useLimitOrdersStateFromUrl'
import {
  getDefaultLimitOrdersState,
  limitOrdersAtom,
  LimitOrdersState,
  updateLimitOrdersAtom,
} from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useLimitOrdersNavigate } from '@cow/modules/limitOrders/hooks/useLimitOrdersNavigate'

export function useSetupLimitOrdersState(): void {
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

    // Case: we have WETH/COW tokens pair
    // User decided to select WETH as output currency, and navigated to WETH/WETH
    // In this case, we reverse tokens pair and the result willbe: COW/WETH
    const areCurrenciesTheSame = tradeStateFromUrl.inputCurrencyId === tradeStateFromUrl.outputCurrencyId
    const inputCurrencyId = areCurrenciesTheSame ? state.outputCurrencyId : tradeStateFromUrl.inputCurrencyId
    const outputCurrencyId = areCurrenciesTheSame ? state.inputCurrencyId : tradeStateFromUrl.outputCurrencyId

    const newState: Partial<LimitOrdersState> = chainIdWasChanged
      ? getDefaultLimitOrdersState(tradeStateFromUrl.chainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || state.recipient,
          inputCurrencyId,
          outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)
    updateLimitOrdersState(newState)
    limitOrdersNavigate(tradeStateFromUrl.chainId, newState.inputCurrencyId || null, newState.outputCurrencyId || null)
  }, [limitOrdersNavigate, updateLimitOrdersState, state, tradeStateFromUrl, shouldSkipUpdate, chainIdWasChanged])
}
