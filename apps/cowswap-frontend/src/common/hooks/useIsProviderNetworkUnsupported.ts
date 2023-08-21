import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'

export function useIsProviderNetworkUnsupported(): boolean {
  const { chainId } = useWeb3React()

  return !!chainId && !(chainId in SupportedChainId)
}
