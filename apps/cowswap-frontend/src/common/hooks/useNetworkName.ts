import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

export function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    return CHAIN_INFO[chainId].label || ''
  }, [chainId])
}
