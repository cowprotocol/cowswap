import { useCapabilities } from 'wagmi'

import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomic?: { status: 'supported' | 'ready' | 'unsupported' }
}

export function useWalletCapabilities(): { data: WalletCapabilities | undefined; isLoading: boolean } {
  const { chainId, account } = useWalletInfo()

  return useCapabilities({ account, chainId })
}
