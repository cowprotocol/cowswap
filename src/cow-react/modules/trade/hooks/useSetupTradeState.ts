import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { switchChain } from 'utils/switchChain'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useTradeNavigate } from './useTradeNavigate'
import { Routes } from '@cow/constants/routes'
import { getDefaultTradeState, TradeState } from '../types/TradeState'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'

export function useSetupTradeState(route: Routes, state: TradeState, updateState: (state: TradeState) => void): void {
  const { chainId: currentChainId, connector } = useWeb3React()
  const tradeNavigate = useTradeNavigate()
  const [isChainIdSet, setIsChainIdSet] = useState(false)
  const tradeStateFromUrl = useTradeStateFromUrl()

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

    const newState: TradeState = chainIdWasChanged
      ? getDefaultTradeState(currentChainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || state.recipient,
          inputCurrencyId,
          outputCurrencyId,
        }

    console.log('UPDATE TRADE STATE:', newState)

    updateState(newState)
    tradeNavigate(currentChainId, newState.inputCurrencyId || null, newState.outputCurrencyId || null)
  }, [tradeNavigate, updateState, state, tradeStateFromUrl, chainIdWasChanged, currentChainId])

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

  useResetStateWithSymbolDuplication(state)
}
