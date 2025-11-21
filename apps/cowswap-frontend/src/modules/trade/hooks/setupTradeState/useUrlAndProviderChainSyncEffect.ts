import { useEffect } from 'react'

import { handleUrlAndProviderChainSync } from './tradeStateUrlSync'
import { SetupTradeStateContext } from './useSetupTradeStateContext'

export function useUrlAndProviderChainSyncEffect(context: SetupTradeStateContext): void {
  const {
    isTokenSelectOpen,
    providerChainId,
    urlChainId,
    prevTradeStateFromUrl,
    currentChainId,
    rememberedUrlStateRef,
    switchNetworkInWallet,
    provider,
    setIsFirstLoad,
  } = context

  useEffect(() => {
    handleUrlAndProviderChainSync({
      isTokenSelectOpen,
      providerChainId,
      urlChainId,
      prevTradeStateFromUrl,
      currentChainId,
      rememberedUrlStateRef,
      switchNetworkInWallet,
      provider,
      setIsFirstLoad,
    })
  }, [
    isTokenSelectOpen,
    providerChainId,
    urlChainId,
    prevTradeStateFromUrl,
    currentChainId,
    rememberedUrlStateRef,
    switchNetworkInWallet,
    provider,
    setIsFirstLoad,
  ])
}
