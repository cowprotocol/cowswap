import { useMemo } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { CHAIN_INFO } from 'constants/chainInfo'
import { supportedChainId } from 'utils/supportedChainId'

export default function useNetworkName(): string | undefined {
  const { chainId } = useActiveWeb3React()

  const network = useMemo(() => {
    const currentChainId = supportedChainId(chainId)
    return currentChainId ? CHAIN_INFO[currentChainId].label : ''
  }, [chainId])

  return network
}
