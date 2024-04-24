import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useWeb3ModalProvider } from '@web3modal/ethers5/react'

export function useProvider(): EthereumProvider | undefined {
  const { walletProvider } = useWeb3ModalProvider()

  return walletProvider as unknown as EthereumProvider
}
