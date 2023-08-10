import { useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

import usePrevious from 'legacy/hooks/usePrevious'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'
import { useWalletInfo } from 'modules/wallet'
import { switchChain } from 'modules/wallet/web3-react/hooks/switchChain'

import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'

import { useTradeState } from '../useTradeState'

export function useSetupTradeState(): void {
  const { chainId: providerChainId, account } = useWalletInfo()
  const prevProviderChainId = usePrevious(providerChainId)

  const { connector } = useWeb3React()
  const tradeNavigate = useTradeNavigate()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()

  // When wallet is connected, and user navigates to the URL with a new chainId
  // We must change chainId in provider, and only then change the trade state
  // Since the network chaning process takes some time, we have to remember the state from URL
  const [rememberedUrlState, setRememberedUrlState] = useState<TradeRawState | null>(null)

  const isWalletConnected = !!account
  const urlChainId = tradeStateFromUrl.chainId
  const prevTradeStateFromUrl = usePrevious(tradeStateFromUrl)

  const currentChainId = !urlChainId ? prevProviderChainId || SupportedChainId.MAINNET : urlChainId

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
  useEffect(() => {
    const { inputCurrencyId, outputCurrencyId } = tradeStateFromUrl
    const providerAndUrlChainIdMismatch = currentChainId !== prevProviderChainId

    const onlyChainIdIsChanged =
      prevTradeStateFromUrl?.inputCurrencyId === inputCurrencyId &&
      prevTradeStateFromUrl?.outputCurrencyId === outputCurrencyId &&
      prevTradeStateFromUrl.chainId !== currentChainId

    const tokensAreEmpty = !inputCurrencyId && !outputCurrencyId

    const sameTokens =
      (inputCurrencyId || outputCurrencyId) && inputCurrencyId?.toLowerCase() === outputCurrencyId?.toLowerCase()

    const defaultState = getDefaultTradeRawState(currentChainId)

    // While network change in progress
    if (rememberedUrlState) {
      // When only chainId is changed, then do nothing
      if (onlyChainIdIsChanged) {
        return
        // When something besides chainId is changed, then reset remembered URL state
      } else {
        setRememberedUrlState(null)
      }
    }

    // Applying of the remembered state after network successfully changed
    if (isWalletConnected && providerAndUrlChainIdMismatch && prevTradeStateFromUrl) {
      setRememberedUrlState(tradeStateFromUrl)
      tradeNavigate(prevTradeStateFromUrl.chainId, prevTradeStateFromUrl)
      console.debug(
        '[TRADE STATE]',
        'Remembering a new state from URL while changing chainId in provider',
        tradeStateFromUrl
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
   *  - connector changes
   *  - (rememberedUrlState)
   *
   * Note: useEagerlyConnect() changes connectors several times at the beginning
   *
   * 1. When chainId in URL is changed, then set it to the provider
   * 2. If provider's chainId is the same with chainId in URL, then do nothing
   * 3. When the URL state is remembered, then set it's chainId to the provider
   */
  useEffect(() => {
    if (!providerChainId || providerChainId === currentChainId) return

    const targetChainId = rememberedUrlState?.chainId || currentChainId

    switchChain(connector, targetChainId).catch((error: Error) => {
      // We are ignoring Gnosis safe context error
      // Because it's a normal situation when we are not in Gnosis safe App
      if (error.name === 'NoSafeContext') return

      console.error('Network switching error: ', error)
    })

    console.debug('[TRADE STATE]', 'Set chainId to provider', { connector, urlChainId })
    // Triggering only when chainId in URL is changes, connector is changed or rememberedUrlState is changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, urlChainId, rememberedUrlState])

  /**
   * On chainId in provider changes
   *
   * 1. Do nothing, when provider's chainId matches to the chainId from URL, or it's not supported
   * 2. Navigate to the new chainId with default tokens
   * 3. If the URL state was remembered, then put it into URL
   */
  useEffect(() => {
    if (providerChainId === urlChainId) return
    if (!providerChainId || providerChainId === prevProviderChainId) return

    if (rememberedUrlState) {
      setRememberedUrlState(null)
      tradeNavigate(rememberedUrlState.chainId, rememberedUrlState)
    } else {
      tradeNavigate(providerChainId, getDefaultTradeRawState(providerChainId))
    }

    console.debug('[TRADE STATE]', 'Provider changed chainId', { providerChainId, urlChanges: rememberedUrlState })
    // Triggering only when chainId was changed in the provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerChainId, prevProviderChainId])

  /**
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(state || null)
}
