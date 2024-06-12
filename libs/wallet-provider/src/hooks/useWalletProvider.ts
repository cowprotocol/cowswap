import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

export function useWalletProvider(): Web3Provider | undefined {
  const { provider } = useWeb3React()

  return provider
}
