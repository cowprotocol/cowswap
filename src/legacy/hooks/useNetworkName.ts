import { useMemo } from 'react'

import { CHAIN_INFO } from 'legacy/constants/chainInfo'

import { useWalletInfo } from 'modules/wallet'

export default function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    return CHAIN_INFO[chainId].label || ''
  }, [chainId])
}
