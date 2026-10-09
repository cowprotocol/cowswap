import { useEffect, useRef } from 'react'

import { useConnection } from 'wagmi'

import { isSupportedChainId } from '@cowprotocol/common-utils'
import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { useLegacySetChainIdToUrl } from 'common/hooks/useLegacySetChainIdToUrl'

/**
 * Syncs the URL when the connected wallet changes chain externally (e.g. via MetaMask).
 * Uses the raw provider chain from useConnection() to avoid the fallback logic in useWalletInfo()
 * that masks unsupported chains with the URL chain.
 */
export function WalletChainUrlSyncUpdater(): null {
  const { chainId, isConnected } = useConnection()
  const solanaProvider = useSolanaWalletProvider()
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const prevChainIdRef = useRef(chainId)
  const isConnectedToSolana = !!solanaProvider

  useEffect(() => {
    // Only sync supported chains from a connected wallet
    // Currently we only support network switching without reconnecting between EVM chains
    if (isConnected && isSupportedChainId(chainId) && !isConnectedToSolana && chainId !== prevChainIdRef.current) {
      setChainIdToUrl(chainId)
    }
    prevChainIdRef.current = chainId
  }, [isConnected, chainId, setChainIdToUrl, isConnectedToSolana])

  return null
}
