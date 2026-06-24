import { useCallback, useEffect, useMemo, useState } from 'react'

import ms from 'ms.macro'
import { useCapabilities } from 'wagmi'

import { useIsSafeViaWc } from '../../wagmi/hooks/useWalletMetadata'
import { useWalletInfo } from '../hooks'

import type { GetCapabilitiesData } from '@wagmi/core/query'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
  atomicBatch?: { supported: boolean }
}

const WALLET_CAPABILITIES_LOADING_TIMEOUT = ms`5s`

export function useWalletCapabilities(): { data: WalletCapabilities | undefined; isLoading: boolean } {
  const { chainId, account } = useWalletInfo()
  const isSafeViaWc = useIsSafeViaWc()

  const shouldFetchCapabilities = useMemo(() => Boolean(account && chainId), [account, chainId])

  const select = useCallback(
    (capabilities: GetCapabilitiesData) => {
      if (!capabilities || !chainId) return undefined

      // Only apply the Safe wallet fallback (first-entry) when connected via Safe WalletConnect,
      // since Safe's wallet_getCapabilities response may omit the chain ID key.
      // For other wallets (e.g. MetaMask), a missing chain entry means the chain is not supported —
      // using a different chain's capabilities would incorrectly enable features like atomic bundling.
      return (capabilities[chainId] || (isSafeViaWc ? Object.values(capabilities)[0] : undefined)) as
        | WalletCapabilities
        | undefined
    },
    [chainId, isSafeViaWc],
  )

  // Fetch capabilities for all chains (no chainId filter) so we can apply
  // the Safe wallet fallback: if the exact chain is missing, use the first entry.
  // See https://github.com/safe-global/safe-wallet-monorepo/issues/6906
  const capabilitiesState = useCapabilities({
    account,
    query: {
      enabled: shouldFetchCapabilities,
      retry: false,
      retryOnMount: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select,
    },
  })

  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false)

  useEffect(() => {
    if (!shouldFetchCapabilities || !capabilitiesState.isLoading) {
      console.debug('[COW][WalletCapabilities]', 'Wallet capabilities timeout reset')
      setHasLoadingTimedOut(false)
      return
    }

    const timeoutId = setTimeout(() => {
      setHasLoadingTimedOut(true)
      console.warn(
        '[COW][WalletCapabilities]',
        `Wallet capabilities loading timed out after ${WALLET_CAPABILITIES_LOADING_TIMEOUT / 1000}s`,
      )
    }, WALLET_CAPABILITIES_LOADING_TIMEOUT)

    return () => clearTimeout(timeoutId)
  }, [shouldFetchCapabilities, capabilitiesState.isLoading])

  if (hasLoadingTimedOut && capabilitiesState.isLoading) {
    return { data: capabilitiesState.data, isLoading: false }
  }

  return capabilitiesState
}
