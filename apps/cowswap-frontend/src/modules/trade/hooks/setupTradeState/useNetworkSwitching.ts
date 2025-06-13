import { useCallback, useRef } from 'react'

import { debounce, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSwitchNetwork } from '@cowprotocol/wallet'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { getDefaultTradeRawState, TradeRawState } from 'modules/trade/types/TradeRawState'

interface UseNetworkSwitchingProps {
  isFirstLoad: boolean
  isWalletConnected: boolean
  urlChainId: SupportedChainId | undefined
  providerChainId: SupportedChainId | undefined
  prevProviderChainId: SupportedChainId | undefined
  setIsFirstLoad: (value: boolean) => void
}

interface UseNetworkSwitchingReturn {
  switchNetworkInWallet: (targetChainId: SupportedChainId) => void
  debouncedSwitchNetworkInWallet: (targetChainId: SupportedChainId) => void
  onProviderNetworkChanges: () => void
  rememberedUrlStateRef: React.RefObject<TradeRawState | null>
}

const INITIAL_CHAIN_ID_FROM_URL = getRawCurrentChainIdFromUrl()

export function useNetworkSwitching({
  isFirstLoad,
  isWalletConnected,
  urlChainId,
  providerChainId,
  prevProviderChainId,
  setIsFirstLoad,
}: UseNetworkSwitchingProps): UseNetworkSwitchingReturn {
  const switchNetwork = useSwitchNetwork()
  const tradeNavigate = useTradeNavigate()
  // When wallet is connected, and user navigates to the URL with a new chainId
  // We must change chainId in provider, and only then change the trade state
  // Since the network chaning process takes some time, we have to remember the state from URL
  const rememberedUrlStateRef = useRef<TradeRawState | null>(null)

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

  const debouncedSwitchNetworkInWallet = debounce((targetChainId: SupportedChainId) => {
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

      tradeNavigate(providerChainId, getDefaultTradeRawState(providerChainId || null))
    }
    // Triggering only when chainId was changed in the provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerChainId, prevProviderChainId])

  return {
    switchNetworkInWallet,
    debouncedSwitchNetworkInWallet,
    onProviderNetworkChanges,
    rememberedUrlStateRef,
  }
}