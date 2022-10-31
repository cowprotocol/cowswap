import { useCallback, useEffect, useState } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { switchChain } from 'utils/switchChain'
import { useLimitOrdersStateFromUrl } from '../hooks/useLimitOrdersStateFromUrl'
import {
  getDefaultLimitOrdersState,
  limitOrdersAtom,
  LimitOrdersState,
  updateLimitOrdersAtom,
} from '../state/limitOrdersAtom'
import { useLimitOrdersNavigate } from '../hooks/useLimitOrdersNavigate'

export function useSetupLimitOrdersState(): void {
  const { chainId: currentChainId, connector } = useWeb3React()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const limitOrdersNavigate = useLimitOrdersNavigate()
  const [isChainIdSet, setIsChainIdSet] = useState(false)
  const tradeStateFromUrl = useLimitOrdersStateFromUrl()

  const chainIdFromUrl = tradeStateFromUrl.chainId
  const chainIdWasChanged = !!currentChainId && chainIdFromUrl !== currentChainId

  const shouldSkipUpdate =
    !chainIdWasChanged &&
    (!tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === state.recipient) &&
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === state.inputCurrencyId?.toLowerCase() &&
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === state.outputCurrencyId?.toLowerCase()

  const updateStateAndNavigate = useCallback(() => {
    // Case: we have WETH/COW tokens pair
    // User decided to select WETH as output currency, and navigated to WETH/WETH
    // In this case, we reverse tokens pair and the result willbe: COW/WETH
    const areCurrenciesTheSame = tradeStateFromUrl.inputCurrencyId === tradeStateFromUrl.outputCurrencyId
    const inputCurrencyId = areCurrenciesTheSame ? state.outputCurrencyId : tradeStateFromUrl.inputCurrencyId
    const outputCurrencyId = areCurrenciesTheSame ? state.inputCurrencyId : tradeStateFromUrl.outputCurrencyId

    const newState: Partial<LimitOrdersState> = chainIdWasChanged
      ? getDefaultLimitOrdersState(currentChainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || state.recipient,
          inputCurrencyId,
          outputCurrencyId,
        }

    console.log('UPDATE LIMIT ORDERS STATE:', newState)

    updateLimitOrdersState(newState)
    limitOrdersNavigate(currentChainId, newState.inputCurrencyId || null, newState.outputCurrencyId || null)
  }, [limitOrdersNavigate, updateLimitOrdersState, state, tradeStateFromUrl, chainIdWasChanged, currentChainId])

  // Set chainId from URL into wallet provider once on page load
  useEffect(() => {
    if (isChainIdSet || !chainIdFromUrl || !currentChainId) return

    setIsChainIdSet(true)
    switchChain(connector, chainIdFromUrl).finally(updateStateAndNavigate)
  }, [isChainIdSet, setIsChainIdSet, chainIdFromUrl, connector, currentChainId, updateStateAndNavigate])

  // Update state when something was changed (chainId or URL params)
  useEffect(() => {
    if (!isChainIdSet || shouldSkipUpdate) return

    updateStateAndNavigate()
  }, [shouldSkipUpdate, isChainIdSet, updateStateAndNavigate])
}
