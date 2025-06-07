import { useCallback, useEffect, useRef, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { debounce, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'

import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useSetupTradeStateFromUrl } from './useSetupTradeStateFromUrl'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'

import { useTradeState } from '../useTradeState'

const INITIAL_CHAIN_ID_FROM_URL = getRawCurrentChainIdFromUrl()
const EMPTY_TOKEN_ID = '_'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useSetupTradeState(): void {
  useSetupTradeStateFromUrl()
  const { chainId: providerChainId, account } = useWalletInfo()
  const prevProviderChainId = usePrevious(providerChainId)

  const provider = useWalletProvider()
  const tradeNavigate = useTradeNavigate()
  const switchNetwork = useSwitchNetwork()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()

  // When wallet is connected, and user navigates to the URL with a new chainId
  // We must change chainId in provider, and only then change the trade state
  // Since the network chaning process takes some time, we have to remember the state from URL
  const rememberedUrlStateRef = useRef<TradeRawState | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const isWalletConnected = !!account
  const urlChainId = tradeStateFromUrl?.chainId
  const prevTradeStateFromUrl = usePrevious(tradeStateFromUrl)

  const currentChainId = !urlChainId ? prevProviderChainId || providerChainId || SupportedChainId.MAINNET : urlChainId

  const isAlternativeModalVisible = useIsAlternativeOrderModalVisible()

  const switchNetworkInWallet = useCallback(
    (targetChainId: SupportedChainId) => {
      switchNetwork(targetChainId).catch((error: Error) => {
        // We are ignoring Gnosis safe context error
        // Because it's a normal situation when we are not in Gnosis safe App
        if (error.name === 'NoSafeContext') return

        console.error('Network switching error: ', error)
      })
    },
    [switchNetwork],
  )

  const debouncedSwitchNetworkInWallet = debounce(([targetChainId]: [SupportedChainId]) => {
    switchNetworkInWallet(targetChainId)
  }, 800)

  const onProviderNetworkChanges = useCallback(() => {
    const rememberedUrlState = rememberedUrlStateRef.current

    if (rememberedUrlState) {
      rememberedUrlStateRef.current = null

      tradeNavigate(rememberedUrlState.chainId, rememberedUrlState)
    } else {
      // When app loaded with connected wallet
      if (isFirstLoad && isWalletConnected) {
        setIsFirstLoad(false)

        // If the app was open without specifying the chainId in the URL, then we should NOT switch to the chainId from the provider
        if (urlChainId && INITIAL_CHAIN_ID_FROM_URL !== null) {
          switchNetworkInWallet(urlChainId)
        }
      }

      tradeNavigate(providerChainId, getDefaultTradeRawState(providerChainId))
    }
    // Triggering only when chainId was changed in the provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerChainId, prevProviderChainId])

  /**
   * On URL parameter changes
   *
   * 1. The case, when chainId in URL was changed while wallet is connected (read about it bellow)
   * 2. When chainId in URL is invalid, then redirect to the default chainId
   * 3. When URL contains the same token symbols (USDC/USDC), then redirect to the default state
   * 4. When URL doesn't contain both tokens, then redirect to the default state
   * 5. When only chainId was changed in URL, then redirect to the default state
   * 6. Otherwise, fill the trade state by data from URL
   *
   * *** When chainId in URL was changed while wallet is connected ***
   * Imagine a case:
   *  - user connected a wallet with chainId = 1, URL looks like /1/swap/WETH
   *  - user changed URL to /100/USDC/COW
   *
   * It will require chainId changes in the wallet to 100
   * In case, if user decline network changes, we will have chainId=100 in URL and chainId=1 in wallet
   * It creates some problem due to chainIds mismatch
   *
   * Because of it, in this case we must:
   *  - revert the URL to the previous state (/1/swap/WETH)
   *  - remember the URL changes (/100/USDC/COW)
   *  - apply the URL changes only if user accepted network changes in the wallet
   */
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  useEffect(() => {
    // Do nothing when in alternative modal
    // App should already be loaded by then
    if (isAlternativeModalVisible) {
      return
    }
    // Not loaded yet, ignore
    if (!tradeStateFromUrl) {
      return
    }

    const { inputCurrencyId, outputCurrencyId } = tradeStateFromUrl
    const providerAndUrlChainIdMismatch = currentChainId !== prevProviderChainId

    const onlyChainIdIsChanged =
      prevTradeStateFromUrl?.inputCurrencyId === inputCurrencyId &&
      prevTradeStateFromUrl?.outputCurrencyId === outputCurrencyId &&
      prevTradeStateFromUrl.chainId !== currentChainId

    const tokensAreEmpty = !inputCurrencyId && !outputCurrencyId

    const sameTokens =
      inputCurrencyId !== EMPTY_TOKEN_ID &&
      (inputCurrencyId || outputCurrencyId) &&
      inputCurrencyId?.toLowerCase() === outputCurrencyId?.toLowerCase()

    const defaultState = getDefaultTradeRawState(currentChainId)

    // While network change in progress and only chainId is changed, then do nothing
    if (rememberedUrlStateRef.current && onlyChainIdIsChanged) {
      return
    }

    // Applying of the remembered state after network successfully changed
    if (isWalletConnected && providerAndUrlChainIdMismatch && prevTradeStateFromUrl) {
      rememberedUrlStateRef.current = tradeStateFromUrl
      tradeNavigate(prevTradeStateFromUrl.chainId, prevTradeStateFromUrl)
      console.debug(
        '[TRADE STATE]',
        'Remembering a new state from URL while changing chainId in provider',
        tradeStateFromUrl,
      )

      return
    }

    if (sameTokens || tokensAreEmpty || onlyChainIdIsChanged) {
      tradeNavigate(currentChainId, defaultState)

      if (sameTokens) {
        console.debug('[TRADE STATE]', 'Url contains invalid tokens, resetting')
      } else if (tokensAreEmpty) {
        console.debug('[TRADE STATE]', 'Url does not contain both tokens, resetting')
      } else if (onlyChainIdIsChanged) {
        // In this case we should update only chainId in the trade state
        updateState?.({ ...state, chainId: currentChainId })
        console.debug('[TRADE STATE]', 'Only chainId was changed in URL, resetting')
      }

      return
    }

    updateState?.(tradeStateFromUrl)
    console.debug('[TRADE STATE]', 'Applying a new state from URL', tradeStateFromUrl)

    // Triggering only on changes from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeStateFromUrl])

  /**
   * On:
   *  - chainId in URL changes
   *  - provider changes
   *
   * Note: useEagerlyConnect() changes connectors several times at the beginning
   *
   * 1. When chainId in URL is changed, then set it to the provider
   * 2. If provider's chainId is the same with chainId in URL, then do nothing
   * 3. When the URL state is remembered, then set it's chainId to the provider
   */
  useEffect(() => {
    // When wallet provider is loaded and chainId matches to the URL chainId
    const isProviderChainIdMatchesUrl = providerChainId === urlChainId

    if (isProviderChainIdMatchesUrl) {
      setIsFirstLoad(false)
    }

    if (!providerChainId || providerChainId === currentChainId) return

    const targetChainId = rememberedUrlStateRef.current?.chainId || currentChainId

    // Debouncing switching multiple time in a quick span of time to avoid running into infinity loop of updating provider and url state.
    // issue GH : https://github.com/cowprotocol/cowswap/issues/4734
    debouncedSwitchNetworkInWallet(targetChainId)

    console.debug('[TRADE STATE]', 'Set chainId to provider', { provider, urlChainId })
    // Triggering only when chainId in URL is changes, provider is changed or rememberedUrlState is changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, urlChainId])

  /**
   * On chainId in provider changes
   *
   * 1. Do nothing, when provider's chainId matches to the chainId from URL, or it's not supported
   * 2. If the URL state was remembered, then put it into URL
   * 3. If it's the first load and wallet is connected, then switch network in the wallet to the chainId from URL
   * 4. Otherwise, navigate to the new chainId with default tokens
   */
  useEffect(() => {
    // When wallet provider is not loaded yet, or chainId has not changed
    const shouldSkip = !providerChainId || providerChainId === urlChainId || providerChainId === prevProviderChainId

    if (shouldSkip) return

    onProviderNetworkChanges()

    console.debug('[TRADE STATE]', 'Provider changed chainId', {
      providerChainId,
      urlChanges: rememberedUrlStateRef.current,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProviderNetworkChanges])

  /**
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(state || null)
}
