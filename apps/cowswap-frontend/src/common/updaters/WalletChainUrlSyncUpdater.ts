import { useEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useConnection } from 'wagmi'

import { useLegacySetChainIdToUrl } from 'common/hooks/useLegacySetChainIdToUrl'

/**
 * Syncs the URL when the connected wallet changes chain externally (e.g. via MetaMask).
 * Uses the raw provider chain from useConnection() to avoid the fallback logic in useWalletInfo()
 * that masks unsupported chains with the URL chain.
 */
export function WalletChainUrlSyncUpdater(): null {
  const { chainId, isConnected } = useConnection()
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const prevChainIdRef = useRef(chainId)

  useEffect(() => {
    // Only sync supported chains from a connected wallet
    if (isConnected && chainId && chainId in SupportedChainId && chainId !== prevChainIdRef.current) {
      setChainIdToUrl(chainId as SupportedChainId)
    }
    prevChainIdRef.current = chainId
  }, [isConnected, chainId, setChainIdToUrl])

  return null
}
