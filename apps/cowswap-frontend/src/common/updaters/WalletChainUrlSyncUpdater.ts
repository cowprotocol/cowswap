import { useEffect, useRef } from 'react'

import { isSupportedChainId } from '@cowprotocol/common-utils'

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
    console.log('[SAFE-DEBUG][WalletChainUrlSyncUpdater]', {
      isConnected,
      chainId,
      prevChainId: prevChainIdRef.current,
      isSupportedChainId: isSupportedChainId(chainId),
      willSync: isConnected && isSupportedChainId(chainId) && chainId !== prevChainIdRef.current,
      currentPathname: window.location.hash,
    })
    // Only sync supported chains from a connected wallet
    if (isConnected && isSupportedChainId(chainId) && chainId !== prevChainIdRef.current) {
      setChainIdToUrl(chainId)
    }
    prevChainIdRef.current = chainId
  }, [isConnected, chainId, setChainIdToUrl])

  return null
}
