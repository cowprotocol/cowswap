import { useAppKitAccount } from '@reown/appkit/react'

/**
 * The connected Solana wallet's address, or `undefined` when no Solana wallet is connected.
 *
 * Unlike `useWalletInfo().account`, this is scoped to the `solana` namespace and stays populated
 * regardless of which chain is currently active — e.g. while browsing Solana as a bridge
 * destination from an EVM-active session.
 */
export function useSolanaAccount(): string | undefined {
  const { address } = useAppKitAccount({ namespace: 'solana' })

  return address
}
