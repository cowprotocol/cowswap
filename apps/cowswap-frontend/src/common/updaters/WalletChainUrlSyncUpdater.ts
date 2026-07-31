import { useEffect, useRef, useState } from 'react'

import { useConnection } from 'wagmi'

import { getRawCurrentChainIdFromUrl, isSupportedChainId } from '@cowprotocol/common-utils'

import { useLegacySetChainIdToUrl } from 'common/hooks/useLegacySetChainIdToUrl'

/**
 * Syncs the URL when the connected wallet changes chain externally (e.g. via MetaMask).
 * Uses the raw provider chain from useConnection() to avoid the fallback logic in useWalletInfo()
 * that masks unsupported chains with the URL chain.
 */
export function WalletChainUrlSyncUpdater(): null {
  const { chainId, isConnected, status } = useConnection()
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const prevChainIdRef = useRef(chainId)
  // Chain explicitly present in the URL at load (user's pre-refresh selection), captured once.
  const [explicitUrlChainId] = useState(getRawCurrentChainIdFromUrl)

  useEffect(() => {
    // Only sync supported chains from a connected wallet
    if (isConnected && isSupportedChainId(chainId)) {
      // While a previous session is being restored on refresh, don't overwrite the chain the
      // user explicitly had in the URL with the wallet's stored chain — that's what switched
      // networks on refresh (#7863). Fresh connects and later user switches still sync as before.
      const preserveUrlDuringRestore =
        status === 'reconnecting' && explicitUrlChainId != null && explicitUrlChainId !== chainId

      if (!preserveUrlDuringRestore && chainId !== prevChainIdRef.current) {
        setChainIdToUrl(chainId)
      }
    }
    prevChainIdRef.current = chainId
  }, [isConnected, chainId, status, setChainIdToUrl, explicitUrlChainId])

  return null
}
