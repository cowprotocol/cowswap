import { useMemo } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { useActiveWeb3React } from '@src/hooks/web3'

export * from '@src/hooks/web3'

/**
 * Provides a Web3Provider instance for active web3 connection, if any
 * Contrary to `getNetworkLibrary` that returns it for the default chainId
 */
export function useActiveWeb3Instance(): Web3Provider | undefined {
  const { library } = useActiveWeb3React()

  return useMemo(() => {
    if (!library?.provider) {
      return
    }
    return new Web3Provider(library.provider)
  }, [library])
}
