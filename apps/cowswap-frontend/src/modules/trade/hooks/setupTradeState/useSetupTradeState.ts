import { useCallback, useEffect, useRef, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { debounce, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { Routes } from 'common/constants/routes'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useIsAlternativeOrderModalVisible } from 'modules/trade/state/alternativeOrder'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'

import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useSetupTradeStateFromUrl } from './useSetupTradeStateFromUrl'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'

import { useTradeState } from '../useTradeState'
import { useTradeTypeInfo } from '../useTradeTypeInfo'

const INITIAL_CHAIN_ID_FROM_URL = getRawCurrentChainIdFromUrl()
const EMPTY_TOKEN_ID = '_'
// Timeout to ensure network change has time to complete
const NETWORK_CHANGE_TIMEOUT = 1000
// Maximum number of retries to update URL
const MAX_URL_UPDATE_RETRIES = 3

export function useSetupTradeState(): void {
  useSetupTradeStateFromUrl()
  const { chainId: providerChainId, account } = useWalletInfo()
  const prevProviderChainId = usePrevious(providerChainId)

  const provider = useWalletProvider()
  const tradeNavigate = useTradeNavigate()
  const switchNetwork = useSwitchNetwork()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()
  const tradeTypeInfo = useTradeTypeInfo()

  // When wallet is connected, and user navigates to the URL with a new chainId
  // We must change chainId in provider, and only then change the trade state
  // Since the network chaning process takes some time, we have to remember the state from URL
  const rememberedUrlStateRef = useRef<TradeRawState | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  // Track network changes in progress with target chainId
  const [pendingNetworkChange, setPendingNetworkChange] = useState<SupportedChainId | null>(null)
  // Use a ref to track if a forced URL update is in progress
  const forceUrlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track retry attempts for URL updates
  const urlUpdateRetryCount = useRef<number>(0)
  // Track if current mode is TWAP (Advanced Orders)
  const isTwapMode = tradeTypeInfo?.route === Routes.ADVANCED_ORDERS

  const isWalletConnected = !!account
  const urlChainId = tradeStateFromUrl?.chainId
  const prevTradeStateFromUrl = usePrevious(tradeStateFromUrl)

  const currentChainId = !urlChainId ? prevProviderChainId || providerChainId || SupportedChainId.MAINNET : urlChainId

  const isAlternativeModalVisible = useIsAlternativeOrderModalVisible()

  // Force update the URL to match provider chainId after network change
  const forceUrlUpdateAfterNetworkChange = useCallback(
    (targetChainId: SupportedChainId) => {
      // Clear any existing timeout
      if (forceUrlUpdateTimeoutRef.current) {
        clearTimeout(forceUrlUpdateTimeoutRef.current)
        forceUrlUpdateTimeoutRef.current = null
      }

      // Set a timeout to ensure all state updates have propagated before forcing URL update
      forceUrlUpdateTimeoutRef.current = setTimeout(() => {
        // Only update if we're still on the same provider chain
        if (targetChainId === providerChainId) {
          urlUpdateRetryCount.current = 0

          // Use default tokens when switching chains
          const defaultState = getDefaultTradeRawState(targetChainId)
          tradeNavigate(targetChainId, defaultState)

          // For TWAP mode, immediately update the state as well to ensure consistency
          if (updateState) {
            updateState({ ...defaultState })
          }
        }

        // Clear pending network change state
        setPendingNetworkChange(null)
        forceUrlUpdateTimeoutRef.current = null
      }, NETWORK_CHANGE_TIMEOUT)
    },
    [providerChainId, tradeNavigate, updateState],
  )

  // Monitor URL state for reversions and force correction if needed
  useEffect(() => {
    // Only for TWAP mode and when we've had a successful provider change
    if (isTwapMode && providerChainId && urlChainId && providerChainId !== urlChainId) {
      // If URL has reverted to old chainId after we thought we updated it
      if (pendingNetworkChange === null && forceUrlUpdateTimeoutRef.current === null) {
        // Only retry a limited number of times to avoid infinite loops
        if (urlUpdateRetryCount.current < MAX_URL_UPDATE_RETRIES) {
          urlUpdateRetryCount.current++
          forceUrlUpdateAfterNetworkChange(providerChainId)
        } else {
          console.error('[TRADE STATE]', 'Exceeded max retries for URL correction', {
            providerChainId,
            urlChainId,
          })
        }
      }
    } else {
      // Reset retry counter when chain IDs match
      urlUpdateRetryCount.current = 0
    }
  }, [providerChainId, urlChainId, isTwapMode, pendingNetworkChange, forceUrlUpdateAfterNetworkChange])

  const switchNetworkInWallet = useCallback(
    (targetChainId: SupportedChainId) => {
      // Set the pending network change to prevent reversion
      setPendingNetworkChange(targetChainId)

      switchNetwork(targetChainId).catch((error: Error) => {
        // Clear the pending state if network switch fails
        setPendingNetworkChange(null)

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
    // Skip if there's no provider chainId
    if (!providerChainId) return

    // When provider chain ID changes, ensure we update the state correctly
    if (pendingNetworkChange && pendingNetworkChange === providerChainId) {
      // Force URL update to ensure it matches the new provider chain
      forceUrlUpdateAfterNetworkChange(providerChainId)
      return
    }

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
        return
      }

      // For any chain change, use default tokens (matching production behavior)
      if (prevProviderChainId && prevProviderChainId !== providerChainId) {
        // Update state with default tokens for the new network
        const defaultState = getDefaultTradeRawState(providerChainId)

        if (updateState) {
          updateState(defaultState)
        }

        tradeNavigate(providerChainId, defaultState)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    providerChainId,
    prevProviderChainId,
    pendingNetworkChange,
    isWalletConnected,
    forceUrlUpdateAfterNetworkChange,
    isFirstLoad,
    urlChainId,
    updateState,
    tradeNavigate,
  ])

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
  // Triggering only on changes from URL, with special handling for TWAP mode to maintain provider/URL chainId sync
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

    // Skip updating from URL while there is a pending network change in progress
    // or if a forced URL update is in progress
    if (pendingNetworkChange !== null || forceUrlUpdateTimeoutRef.current !== null) {
      return
    }

    // Critical check: if provider has changed but URL hasn't updated yet, skip this update
    if (providerChainId && tradeStateFromUrl.chainId !== providerChainId && prevProviderChainId !== providerChainId) {
      // For TWAP mode, force URL correction immediately
      if (isTwapMode) {
        forceUrlUpdateAfterNetworkChange(providerChainId)
      }

      return
    }

    // TWAP mode with a mismatch between URL and provider chainId (when not in the middle of a change)
    if (isTwapMode && providerChainId && tradeStateFromUrl.chainId !== providerChainId) {
      forceUrlUpdateAfterNetworkChange(providerChainId)
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tradeStateFromUrl, pendingNetworkChange, providerChainId, isTwapMode, forceUrlUpdateAfterNetworkChange])

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
  // Triggering only when chainId in URL changes, provider changes, or rememberedUrlState changes
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (forceUrlUpdateTimeoutRef.current) {
        clearTimeout(forceUrlUpdateTimeoutRef.current)
      }
    }
  }, [])

  /**
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(state || null)
}
