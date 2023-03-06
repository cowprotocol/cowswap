import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useTradeNavigate } from '../useTradeNavigate'
import { getDefaultTradeState, TradeCurrenciesIds, TradeState } from '../../types/TradeState'
import { useTradeState } from '../useTradeState'
import { switchChain } from '@cow/modules/wallet/web3-react/hooks/switchChain'
import usePrevious from 'hooks/usePrevious'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { Nullish } from '@cow/types'
import { useWalletInfo } from '@cow/modules/wallet'

function areCurrenciesTheSame({ inputCurrencyId, outputCurrencyId }: TradeState): boolean {
  if (!inputCurrencyId && !outputCurrencyId) return false

  return inputCurrencyId?.toLowerCase() === outputCurrencyId?.toLowerCase()
}

/**
 * Case: we have WETH/COW tokens pair in the sore
 * User decided to select WETH as output currency, and navigated to WETH/WETH
 * In this case, we reverse tokens pair and the result will be: COW/WETH
 */
function getUpdatedCurrenciesIds(tradeStateFromUrl: TradeState, tradeStateFromStore: TradeState): TradeCurrenciesIds {
  const currenciesAreTheSame = areCurrenciesTheSame(tradeStateFromUrl)

  const inputCurrencyId = currenciesAreTheSame
    ? tradeStateFromStore.outputCurrencyId
    : tradeStateFromUrl.inputCurrencyId

  const outputCurrencyId = currenciesAreTheSame
    ? tradeStateFromStore.inputCurrencyId
    : tradeStateFromUrl.outputCurrencyId

  return { inputCurrencyId, outputCurrencyId }
}

function shouldSkipUpdate(tradeStateFromUrl: TradeState, tradeStateFromStore: TradeState): boolean {
  const chainIdIsNotChanged = tradeStateFromUrl.chainId === tradeStateFromStore.chainId
  const inputCurrencyIsNotChanged =
    tradeStateFromUrl.inputCurrencyId?.toLowerCase() === tradeStateFromStore.inputCurrencyId?.toLowerCase()
  const outputCurrencyIsNotChanged =
    tradeStateFromUrl.outputCurrencyId?.toLowerCase() === tradeStateFromStore.outputCurrencyId?.toLowerCase()
  const recipientIsNotChanged =
    !tradeStateFromUrl.recipient || tradeStateFromUrl.recipient === tradeStateFromStore.recipient

  return chainIdIsNotChanged && recipientIsNotChanged && inputCurrencyIsNotChanged && outputCurrencyIsNotChanged
}

function areChainIdsTheSame(aChainId: Nullish<number>, bChainId: Nullish<number>): boolean {
  return !!aChainId && !!bChainId && aChainId !== bChainId
}

export function useSetupTradeState(): void {
  const { chainId: providerChainId, account } = useWalletInfo()
  const { connector } = useWeb3React()
  const [isChainIdSet, setIsChainIdSet] = useState(false)
  const tradeNavigate = useTradeNavigate()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const tradeState = useTradeState()

  const chainIdFromUrl = tradeStateFromUrl.chainId
  // When there is no account from provider, then we consider provider as not connected and use chainId from URL as current
  const currentChainId = (account ? providerChainId : chainIdFromUrl) || providerChainId

  const prevChainIdFromUrl = usePrevious(chainIdFromUrl)
  const prevCurrentChainId = usePrevious(currentChainId)

  const chainIdFromUrlWasChanged = areChainIdsTheSame(chainIdFromUrl, prevChainIdFromUrl)
  const chainIdFromProviderWasChanged =
    areChainIdsTheSame(currentChainId, prevCurrentChainId) || areChainIdsTheSame(currentChainId, chainIdFromUrl)

  const skipUpdate = useMemo(() => {
    if (areCurrenciesTheSame(tradeStateFromUrl)) return false

    if (chainIdFromUrlWasChanged && !!account) return true

    if (chainIdFromProviderWasChanged) return false

    return tradeState ? shouldSkipUpdate(tradeStateFromUrl, tradeState.state) : true
  }, [tradeState, tradeStateFromUrl, chainIdFromProviderWasChanged, chainIdFromUrlWasChanged, account])

  const newChainId = useMemo(() => {
    const providerChainId = currentChainId || SupportedChainId.MAINNET
    const validChainIdFromUrl = isSupportedChainId(chainIdFromUrl || undefined)
      ? chainIdFromUrl || providerChainId
      : providerChainId

    if (!account) {
      // When wallet is not connected and network was changed in the provider, then use chainId from provider
      if (chainIdFromProviderWasChanged) {
        return providerChainId
      } else {
        // When wallet is not connected, then use chainId from URL by priority and fallback to provider's value
        return validChainIdFromUrl
      }
    } else {
      // When wallet is connected, then always use chainId from provider
      return providerChainId
    }
  }, [account, chainIdFromProviderWasChanged, chainIdFromUrl, currentChainId])

  const updateStateAndNavigate = useCallback(() => {
    if (!tradeState) return

    // Reset state to default when chainId was changed in the provider
    const newState: TradeState = chainIdFromProviderWasChanged
      ? getDefaultTradeState(newChainId)
      : {
          chainId: newChainId,
          recipient: tradeStateFromUrl.recipient || tradeState.state.recipient,
          ...getUpdatedCurrenciesIds(tradeStateFromUrl, tradeState.state),
        }

    console.debug('UPDATE TRADE STATE:', newState)

    tradeState.updateState(newState)

    tradeNavigate(newState.chainId, {
      inputCurrencyId: newState.inputCurrencyId || null,
      outputCurrencyId: newState.outputCurrencyId || null,
    })
  }, [tradeNavigate, newChainId, chainIdFromProviderWasChanged, tradeState, tradeStateFromUrl])

  /**
   * STEP 1
   * Unlock network switching in the provider when chainId was changed in the URL
   */
  useLayoutEffect(() => {
    if (chainIdFromUrlWasChanged) {
      setIsChainIdSet(false)
    }
  }, [chainIdFromUrlWasChanged])

  /**
   * STEP 2
   * Set chainId from URL into wallet provider once on page load
   * It's needed because useWeb3React() returns mainnet chainId by default
   */
  useLayoutEffect(() => {
    if (isChainIdSet || !chainIdFromUrl || !currentChainId) return
    let isSubscribed = true

    setIsChainIdSet(true)

    switchChain(connector, chainIdFromUrl)
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        if (!isSubscribed) return

        updateStateAndNavigate()
      })

    return () => {
      isSubscribed = false
    }
  }, [isChainIdSet, chainIdFromUrl, connector, currentChainId, updateStateAndNavigate])

  /**
   * STEP 3
   * Update state in the store when something was changed (chainId or URL params)
   */
  useLayoutEffect(() => {
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
