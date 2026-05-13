import { EthereumProvider } from '@cowprotocol/widget-lib'

import { useAppKitProvider } from '@reown/appkit/react'

/**
 * Returns the active wallet's EIP-1193 provider for the widget's dapp mode.
 *
 * AppKit's `useAppKitProvider('eip155')` returns the active EIP-1193 provider
 * directly (injected, EIP-6963, WalletConnect — whichever is connected), so we
 * don't need to go through wagmi's connector API.
 */
export function useProvider(): EthereumProvider | undefined {
  const { walletProvider } = useAppKitProvider<EthereumProvider>('eip155')
  return walletProvider
}
