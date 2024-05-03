import { useWeb3React } from '@web3-react/core'

export function useWalletChainId(): number | undefined {
  const { chainId } = useWeb3React()

  return chainId
}
