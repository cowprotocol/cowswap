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
  const { chainId, isConnected } = useConnection()
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const prevChainIdRef = useRef(chainId)
  // Chain explicitly present in the URL at load (user's pre-refresh selection), captured once.
  const [explicitUrlChainId] = useState(getRawCurrentChainIdFromUrl)
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    // Only sync supported chains from a connected wallet
    if (isConnected && isSupportedChainId(chainId)) {
      const isInitialReconnect = !hasSyncedRef.current
      hasSyncedRef.current = true

      // On the first reconnect emission, don't overwrite a chain the user explicitly had in
      // the URL with the wallet's stored chain — that's what switched networks on refresh (#7863).
      // Later chain switches (and cases without an explicit URL chain) still sync as before.
      const skipInitialOverride = isInitialReconnect && explicitUrlChainId != null && explicitUrlChainId !== chainId

      if (!skipInitialOverride && chainId !== prevChainIdRef.current) {
        setChainIdToUrl(chainId)
      }
    } else if (!isConnected) {
      hasSyncedRef.current = false
    }
    prevChainIdRef.current = chainId
  }, [isConnected, chainId, setChainIdToUrl, explicitUrlChainId])

  return null
}
