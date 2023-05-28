import { useMemo } from 'react'

import { useWalletInfo } from 'modules/wallet'

import { CHAIN_INFO } from 'legacy/constants/chainInfo'
import { supportedChainId } from 'legacy/utils/supportedChainId'

export default function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  const network = useMemo(() => {
    const currentChainId = supportedChainId(chainId)
    return currentChainId ? CHAIN_INFO[currentChainId].label : ''
  }, [chainId])

  return network
}
