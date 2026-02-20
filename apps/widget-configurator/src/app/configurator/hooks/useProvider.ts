import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useAppKitProvider } from '@reown/appkit/react'

export function useProvider(): EthereumProvider | undefined {
  const { walletProvider } = useAppKitProvider('eip155')

  return walletProvider as unknown as EthereumProvider
}
