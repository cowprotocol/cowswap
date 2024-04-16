import { Web3Provider } from '@ethersproject/providers'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { useMemo } from 'react'

export function useWalletProvider() {
  const { walletProvider } = useWeb3ModalProvider()

  return useMemo(() => {
    if (!walletProvider) return undefined

    return new Web3Provider(walletProvider)
  }, [walletProvider])
}
