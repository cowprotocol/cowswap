import { useMemo } from 'react'

import { CHAIN_INFO } from 'legacy/constants/chainInfo'
import { supportedChainId } from 'legacy/utils/supportedChainId'

import { useWalletInfo } from 'modules/wallet'

export default function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  const network = useMemo(() => {
    const currentChainId = supportedChainId(chainId)
    return currentChainId ? CHAIN_INFO[currentChainId].label : ''
  }, [chainId])

  return network
}
