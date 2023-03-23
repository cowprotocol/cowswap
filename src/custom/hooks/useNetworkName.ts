import { useMemo } from 'react'
import { CHAIN_INFO } from 'constants/chainInfo'
import { supportedChainId } from 'utils/supportedChainId'
import { useWalletInfo } from '@cow/modules/wallet'

export default function useNetworkName(): string | undefined {
  const { chainId } = useWalletInfo()

  const network = useMemo(() => {
    const currentChainId = supportedChainId(chainId)
    return currentChainId ? CHAIN_INFO[currentChainId].label : ''
  }, [chainId])

  return network
}
