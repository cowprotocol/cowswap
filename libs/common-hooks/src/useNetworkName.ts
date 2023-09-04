import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowswap/common-const'

import { useWalletInfo } from '@cowswap/wallet'

export function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    return CHAIN_INFO[chainId].label || ''
  }, [chainId])
}
