import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useTradeNavigate } from './useTradeNavigate'
import { getDefaultTradeState, TradeState } from '../types/TradeState'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useTradeState } from './useTradeState'
import { useSetupChainId } from './useSetupChainId'

export function useSetupTradeState(): void {
  const { chainId: currentChainId } = useWeb3React()
  const tradeNavigate = useTradeNavigate()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const tradeState = useTradeState()

  const chainIdFromUrl = tradeStateFromUrl.chainId
  const chainIdWasChanged = !!currentChainId && chainIdFromUrl !== currentChainId

  const shouldSkipUpdate =
    !chainIdWasChanged &&
    !!tradeState &&
    (!tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === tradeState.state.recipient) &&
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === tradeState.state.inputCurrencyId?.toLowerCase() &&
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === tradeState.state.outputCurrencyId?.toLowerCase()

  const updateStateAndNavigate = useCallback(() => {
    if (!tradeState) return
    // Case: we have WETH/COW tokens pair
    // User decided to select WETH as output currency, and navigated to WETH/WETH
    // In this case, we reverse tokens pair and the result willbe: COW/WETH
    const areCurrenciesTheSame = tradeStateFromUrl.inputCurrencyId === tradeStateFromUrl.outputCurrencyId
    const inputCurrencyId = areCurrenciesTheSame ? tradeState.state.outputCurrencyId : tradeStateFromUrl.inputCurrencyId
    const outputCurrencyId = areCurrenciesTheSame
      ? tradeState.state.inputCurrencyId
      : tradeStateFromUrl.outputCurrencyId

    const newState: TradeState = chainIdWasChanged
      ? getDefaultTradeState(currentChainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || tradeState.state.recipient,
          inputCurrencyId,
          outputCurrencyId,
        }

    console.log('UPDATE TRADE STATE:', newState)

    tradeState.updateState(newState)
    tradeNavigate(currentChainId, newState.inputCurrencyId || null, newState.outputCurrencyId || null)
  }, [tradeNavigate, tradeState, tradeStateFromUrl, chainIdWasChanged, currentChainId])

  useSetupChainId(shouldSkipUpdate, chainIdFromUrl, updateStateAndNavigate)

  useResetStateWithSymbolDuplication(tradeState?.state || null)
}
