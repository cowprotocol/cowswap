import { useEffect, useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useLegacySetChainIdToUrl } from 'common/hooks/useLegacySetChainIdToUrl'

/**
 * Syncs the URL when the connected wallet changes chain externally (e.g. via MetaMask).
 * Without this, disconnecting after an external chain switch would revert to the stale URL chain.
 */
export function WalletChainUrlSyncUpdater(): null {
  const { chainId, active } = useWalletInfo()
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const prevChainIdRef = useRef(chainId)

  useEffect(() => {
    if (active && chainId !== prevChainIdRef.current) {
      setChainIdToUrl(chainId)
    }
    prevChainIdRef.current = chainId
  }, [active, chainId, setChainIdToUrl])

  return null
}
