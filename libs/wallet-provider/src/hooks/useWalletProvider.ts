import { Web3Provider } from '@ethersproject/providers'
import { useWeb3ModalProvider } from '@web3modal/ethers5/react'
import useSWR from 'swr'

export function useWalletProvider() {
  const { walletProvider } = useWeb3ModalProvider()

  return useSWR([walletProvider], () => (walletProvider ? new Web3Provider(walletProvider) : undefined)).data
}
