import { useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useNetworkSwitching } from './useNetworkSwitching'
import { useProviderChanges } from './useProviderChanges'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useSetupTradeStateFromUrl } from './useSetupTradeStateFromUrl'
import { useTradeStateFromUrl } from './useTradeStateFromUrl'
import { useUrlStateHandling } from './useUrlStateHandling'

import { useTradeState } from '../useTradeState'

export function useSetupTradeState(): void {
  useSetupTradeStateFromUrl()
  const { chainId: providerChainId, account } = useWalletInfo()
  const prevProviderChainId = usePrevious(providerChainId)
  const tradeStateFromUrl = useTradeStateFromUrl()
  const { state, updateState } = useTradeState()
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const isWalletConnected = !!account
  const urlChainId = tradeStateFromUrl?.chainId
  const currentChainId = !urlChainId ? prevProviderChainId || providerChainId || SupportedChainId.MAINNET : urlChainId

  const { rememberedUrlStateRef, debouncedSwitchNetworkInWallet, onProviderNetworkChanges } = useNetworkSwitching({
    isFirstLoad,
    isWalletConnected,
    urlChainId: urlChainId || undefined,
    providerChainId,
    prevProviderChainId,
    setIsFirstLoad,
  })

  useUrlStateHandling({
    currentChainId,
    prevProviderChainId,
    isWalletConnected,
    rememberedUrlStateRef,
    updateState,
    state: state || null,
  })

  useProviderChanges({
    providerChainId,
    urlChainId: urlChainId || undefined,
    currentChainId,
    prevProviderChainId,
    setIsFirstLoad,
    rememberedUrlStateRef,
    debouncedSwitchNetworkInWallet,
    onProviderNetworkChanges,
  })

  /**
   * If user opened a link with some token symbol, and we have more than one token with the same symbol in the listing
   * Then we show alert, reset trade state to default and ask user to select token using UI
   */
  useResetStateWithSymbolDuplication(state || null)
}
