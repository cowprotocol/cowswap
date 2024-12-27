import { useAppKitProvider } from '@reown/appkit/react'

export function useIsWalletConnect(): boolean {
  const { walletProviderType } = useAppKitProvider('eip155')

  return walletProviderType === 'WALLET_CONNECT'
}
