import { useCallback, useEffect, useRef, useState } from 'react'

import { useIsWindowVisible, usePrevious } from '@cowprotocol/common-hooks'
import { getRawCurrentChainIdFromUrl, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useTradeTypeInfoFromUrl } from 'modules/trade/hooks/useTradeTypeInfoFromUrl'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'
import { TradeType } from 'modules/trade/types/TradeType'

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

  const isWindowVisible = useIsWindowVisible()
  const prevIsWindowVisible = usePrevious(isWindowVisible)
  const tradeNavigate = useTradeNavigate()
  const switchNetwork = useSwitchNetwork()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()
  const tradeTypeInfo = useTradeTypeInfoFromUrl()

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
  const isLimitOrderTrade = tradeTypeInfo?.tradeType === TradeType.LIMIT_ORDER

  const switchNetworkInWallet = useCallback(
    async (targetChainId: SupportedChainId, currentProviderChainId: SupportedChainId | null) => {
      try {
        await switchNetwork(targetChainId)
      } catch (error) {
        // We are ignoring Gnosis safe context error
        // Because it's a normal situation when we are not in Gnosis safe App
        if (error.name === 'NoSafeContext') return

        console.error('Network switching error: ', error)

        // If user rejected the network switch, revert the URL to the provider's current chain
        // This ensures URL and wallet stay in sync, and user can try again
        if (isRejectRequestProviderError(error) && currentProviderChainId) {
          const defaultState = getDefaultTradeRawState(currentProviderChainId)
          tradeNavigate(currentProviderChainId, defaultState)
        }
      }

      // Clean up rememberedUrlStateRef when network switching is finished
      rememberedUrlStateRef.current = null
    },
    [switchNetwork, tradeNavigate],
  )

  const navigateAndSwitchNetwork = useCallback(
    async (
      chainId: number | null,
      tradeState: TradeRawState,
      currentProviderChainId: SupportedChainId | null,
    ): Promise<void> => {
      await tradeNavigate(chainId, tradeState)
      await switchNetworkInWallet(chainId || SupportedChainId.MAINNET, currentProviderChainId)
    },
    [tradeNavigate, switchNetworkInWallet],
  )

  const onProviderNetworkChanges = useCallback(() => {
    const rememberedUrlState = rememberedUrlStateRef.current

    if (rememberedUrlState) {
      rememberedUrlStateRef.current = null

      navigateAndSwitchNetwork(rememberedUrlState.chainId, rememberedUrlState, prevProviderChainId)
    } else {
      // When app loaded with connected wallet
      if (isFirstLoad && isWalletConnected) {
        setIsFirstLoad(false)

        // If the app was open without specifying the chainId in the URL, then we should NOT switch to the chainId from the provider
        if (urlChainId && INITIAL_CHAIN_ID_FROM_URL !== null) {
          switchNetworkInWallet(urlChainId, providerChainId)
        }
      }

      navigateAndSwitchNetwork(providerChainId, getDefaultTradeRawState(providerChainId), null)
    }
    // Triggering only when chainId was changed in the provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerChainId, prevProviderChainId])

  /**
   * On URL parameter changes
   *
   * 1. The case, when chainId in URL was changed while wallet is connected (read about it below)
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
    // Do nothing when in alternative modal for limit order routes
    // App should already be loaded by then
    if (isAlternativeModalVisible && isLimitOrderTrade) {
      return
    }
    // Not loaded yet, ignore
    if (!tradeStateFromUrl) {
      return
    }

    const { inputCurrencyId, outputCurrencyId, chainId, targetChainId } = tradeStateFromUrl
    const providerAndUrlChainIdMismatch = currentChainId !== prevProviderChainId

    const onlyChainIdIsChanged =
      prevTradeStateFromUrl?.inputCurrencyId === inputCurrencyId &&
      prevTradeStateFromUrl?.outputCurrencyId === outputCurrencyId &&
      prevTradeStateFromUrl.chainId !== currentChainId

    const tokensAreEmpty = !inputCurrencyId && !outputCurrencyId

    const sameTokens =
      inputCurrencyId !== EMPTY_TOKEN_ID &&
      (inputCurrencyId || outputCurrencyId) &&
      // Not cross-chain swap
      (!targetChainId || chainId === targetChainId) &&
      inputCurrencyId?.toLowerCase() === outputCurrencyId?.toLowerCase()

    const defaultState = getDefaultTradeRawState(currentChainId)

    // While network change in progress and only chainId is changed, then do nothing
    if (rememberedUrlStateRef.current && onlyChainIdIsChanged) {
      return
    }

    // Applying of the remembered state after network successfully changed
    if (isWalletConnected && providerAndUrlChainIdMismatch && prevTradeStateFromUrl) {
      rememberedUrlStateRef.current = tradeStateFromUrl
      updateState?.(tradeStateFromUrl)
      console.debug(
        '[TRADE STATE]',
        'Remembering a new state from URL while changing chainId in provider',
        tradeStateFromUrl,
      )

      return
    }

    if (sameTokens || tokensAreEmpty || onlyChainIdIsChanged) {
      navigateAndSwitchNetwork(currentChainId, defaultState, prevProviderChainId)

      if (sameTokens) {
        console.debug('[TRADE STATE]', 'Url contains invalid tokens, resetting')
      } else if (tokensAreEmpty) {
        console.debug('[TRADE STATE]', 'Url does not contain both tokens, resetting')
      } else if (onlyChainIdIsChanged) {
        updateState?.({ ...state, chainId: currentChainId })
        console.debug('[TRADE STATE]', 'Only chainId was changed in URL, resetting')
      }

      return
    }

    updateState?.(tradeStateFromUrl)
    console.debug('[TRADE STATE]', 'Applying a new state from URL', tradeStateFromUrl)

    // Triggering only on changes from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeStateFromUrl, isAlternativeModalVisible, isLimitOrderTrade])

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

    // Skip network switching when chainId in URL is not changed
    const isUrlChainIdChanged = Boolean(urlChainId && urlChainId !== prevTradeStateFromUrl?.chainId)

    if (!providerChainId || providerChainId === currentChainId || !isUrlChainIdChanged) return

    const targetChainId = urlChainId ?? rememberedUrlStateRef.current?.chainId ?? currentChainId
    switchNetworkInWallet(targetChainId, providerChainId)

    console.debug('[TRADE STATE]', 'Set chainId to provider', { providerChainId, urlChainId })
    // Triggering only when chainId in URL is changes, provider is changed or rememberedUrlState is changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlChainId])

  /**
   * On chainId in provider changes
   *
   * 1. Do nothing, when provider's chainId matches to the chainId from URL, or it's not supported
   * 2. If the URL state was remembered, then put it into URL
   * 3. If it's the first load and wallet is connected, then switch network in the wallet to the chainId from URL
   * 4. Otherwise, navigate to the new chainId with default tokens
   */
  useEffect(() => {
    // When we came back to the tab and there is a new chainId in provider
    const providerChangedNetworkWhenWindowInactive =
      isWindowVisible && prevIsWindowVisible !== isWindowVisible && providerChainId !== urlChainId

    // When wallet provider is not loaded yet, or chainId has not changed
    const noNetworkChanges =
      !providerChainId || providerChainId === urlChainId || providerChainId === prevProviderChainId

    const shouldSkip = !providerChangedNetworkWhenWindowInactive && noNetworkChanges

    /**
     * Ignore provider network changes till tab is inactive
     * Otherwise, it can go into a network switching loop
     */
    if (!isWindowVisible) return

    if (shouldSkip) return

    onProviderNetworkChanges()

    console.debug('[TRADE STATE]', 'Provider changed chainId', {
      providerChainId,
      urlChanges: rememberedUrlStateRef.current,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWindowVisible, onProviderNetworkChanges])

  /**
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(state || null)
}
