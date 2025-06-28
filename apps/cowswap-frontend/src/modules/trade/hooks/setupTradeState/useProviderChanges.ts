import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { TradeRawState } from 'modules/trade/types/TradeRawState'

interface UseProviderChangesProps {
  providerChainId: SupportedChainId | undefined
  urlChainId: SupportedChainId | undefined
  currentChainId: SupportedChainId
  prevProviderChainId: SupportedChainId | undefined
  setIsFirstLoad: (value: boolean) => void
  rememberedUrlStateRef: React.RefObject<TradeRawState | null>
  debouncedSwitchNetworkInWallet: (targetChainId: SupportedChainId) => void
  onProviderNetworkChanges: () => void
}

export function useProviderChanges({
  providerChainId,
  urlChainId,
  currentChainId,
  prevProviderChainId,
  setIsFirstLoad,
  rememberedUrlStateRef,
  debouncedSwitchNetworkInWallet,
  onProviderNetworkChanges,
}: UseProviderChangesProps): void {
  const provider = useWalletProvider()

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
}