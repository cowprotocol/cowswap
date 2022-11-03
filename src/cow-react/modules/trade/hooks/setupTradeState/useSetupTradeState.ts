import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useTradeNavigate } from '../useTradeNavigate'
import { getDefaultTradeState, TradeCurrenciesIds, TradeState } from '../../types/TradeState'
import { useTradeState } from '../useTradeState'
import { switchChain } from 'utils/switchChain'

/**
 * Case: we have WETH/COW tokens pair in the sore
 * User decided to select WETH as output currency, and navigated to WETH/WETH
 * In this case, we reverse tokens pair and the result will be: COW/WETH
 */
function getUpdatedCurrenciesIds(tradeStateFromUrl: TradeState, tradeStateFromStore: TradeState): TradeCurrenciesIds {
  const areCurrenciesTheSame = tradeStateFromUrl.inputCurrencyId === tradeStateFromUrl.outputCurrencyId

  const inputCurrencyId = areCurrenciesTheSame
    ? tradeStateFromStore.outputCurrencyId
    : tradeStateFromUrl.inputCurrencyId

  const outputCurrencyId = areCurrenciesTheSame
    ? tradeStateFromStore.inputCurrencyId
    : tradeStateFromUrl.outputCurrencyId

  return { inputCurrencyId, outputCurrencyId }
}

function shouldSkipUpdate(
  chainIdWasChanged: boolean,
  tradeStateFromUrl: TradeState,
  tradeStateFromStore: TradeState
): boolean {
  const inputCurrencyIsNotChanged =
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === tradeStateFromStore.inputCurrencyId?.toLowerCase()
  const outputCurrencyIsNotChanged =
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === tradeStateFromStore.outputCurrencyId?.toLowerCase()
  const recipientIsNotChanged =
    !tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === tradeStateFromStore.recipient

  return !chainIdWasChanged && recipientIsNotChanged && inputCurrencyIsNotChanged && outputCurrencyIsNotChanged
}

export function useSetupTradeState(): void {
  const { chainId: currentChainId, connector } = useWeb3React()
  const [isChainIdSet, setIsChainIdSet] = useState(false)
  const tradeNavigate = useTradeNavigate()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const tradeState = useTradeState()

  const chainIdFromUrl = tradeStateFromUrl.chainId || currentChainId
  const chainIdWasChanged = !!currentChainId && chainIdFromUrl !== currentChainId
  const skipUpdate = tradeState ? shouldSkipUpdate(chainIdWasChanged, tradeStateFromUrl, tradeState.state) : true

  const updateStateAndNavigate = useCallback(() => {
    if (!tradeState) return

    // Reset state to default when chainId was changed or there are no both tokens in URL
    const shouldResetStateToDefault =
      currentChainId &&
      (chainIdWasChanged || (!tradeStateFromUrl.inputCurrencyId && !tradeStateFromUrl.outputCurrencyId))

    const newState: TradeState = shouldResetStateToDefault
      ? getDefaultTradeState(currentChainId)
      : {
          chainId: tradeStateFromUrl.chainId,
          recipient: tradeStateFromUrl.recipient || tradeState.state.recipient,
          ...getUpdatedCurrenciesIds(tradeStateFromUrl, tradeState.state),
        }

    console.debug('UPDATE TRADE STATE:', newState)

    tradeState.updateState(newState)

    tradeNavigate(currentChainId, {
      inputCurrencyId: newState.inputCurrencyId || null,
      outputCurrencyId: newState.outputCurrencyId || null,
    })
  }, [tradeNavigate, tradeState, tradeStateFromUrl, chainIdWasChanged, currentChainId])

  /**
   * STEP 1
   * Set chainId from URL into wallet provider once on page load
   * It's needed because useWeb3React() returns mainnet chainId by default
   */
  useEffect(() => {
    if (isChainIdSet || !chainIdFromUrl || !currentChainId) return

    setIsChainIdSet(true)
    switchChain(connector, chainIdFromUrl).finally(updateStateAndNavigate)
  }, [isChainIdSet, setIsChainIdSet, chainIdFromUrl, connector, currentChainId, updateStateAndNavigate])

  /**
   * STEP 2
   * Update state in the store when something was changed (chainId or URL params)
   */
  useEffect(() => {
    if (!isChainIdSet || skipUpdate) return

    updateStateAndNavigate()
  }, [skipUpdate, isChainIdSet, updateStateAndNavigate])

  /**
   * STEP 3
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(tradeState?.state || null)
}
