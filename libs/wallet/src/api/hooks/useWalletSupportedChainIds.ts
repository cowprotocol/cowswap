import { useMemo } from 'react'

import { useWalletCapabilities, WalletCapabilities } from './useWalletCapabilities'

function hasAtomicBatchSupport(capabilities: WalletCapabilities | undefined): boolean {
  const status = capabilities?.atomic?.status
  return status === 'supported' || status === 'ready'
}

export function useWalletSupportedChainIds(): Set<number> | undefined {
  const { allChains, isLoading } = useWalletCapabilities()

  return useMemo(() => {
    if (!allChains || isLoading) return undefined

    const ids = Object.entries(allChains)
      .filter(([, caps]) => hasAtomicBatchSupport(caps))
      .map(([id]) => Number(id))

    return ids.length > 0 ? new Set(ids) : undefined
  }, [allChains, isLoading])
}
