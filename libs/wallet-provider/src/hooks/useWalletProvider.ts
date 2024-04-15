import { useWeb3React } from '@web3-react/core'
import type { Web3Provider } from '@ethersproject/providers'

/**
 * TODO: replace by WAGMI
 */
export function useWalletProvider(): Web3Provider | undefined {
  const { provider } = useWeb3React()

  return provider
}
