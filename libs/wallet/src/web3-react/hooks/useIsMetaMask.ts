import { useWeb3ModalProvider } from '@web3modal/ethers5/react'

export function useIsMetaMask(): boolean {
  const { walletProvider } = useWeb3ModalProvider()

  return walletProvider?.isMetaMask ?? false
}
