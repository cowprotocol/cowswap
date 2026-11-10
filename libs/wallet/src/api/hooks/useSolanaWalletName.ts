import { useWalletInfo as useReownWalletInfo } from '@reown/appkit/react'

/**
 * The connected Solana wallet's name — its WalletConnect session peer name, or its connector name
 * for a browser wallet. `undefined` when no Solana wallet is connected.
 *
 * Scoped to the `solana` namespace, so it stays populated while another namespace is active.
 */
export function useSolanaWalletName(): string | undefined {
  const { walletInfo } = useReownWalletInfo('solana')

  return walletInfo?.name
}
