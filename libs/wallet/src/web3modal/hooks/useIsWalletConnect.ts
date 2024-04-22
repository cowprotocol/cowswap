import { useWeb3ModalProvider } from '@web3modal/ethers5/react'

export function useIsWalletConnect(): boolean {
  const { walletProviderType } = useWeb3ModalProvider()

  return walletProviderType === 'walletConnect'
}
