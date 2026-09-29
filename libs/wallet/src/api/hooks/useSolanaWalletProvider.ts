import { useAppKitProvider } from '@reown/appkit/react'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

/**
 * The connected Solana wallet's provider, or `undefined` when no Solana wallet is connected.
 *
 * Solana counterpart to wagmi's `useWalletClient`. Note that this provider does *not* populate
 * `recentBlockhash` or `feePayer` — callers must build complete transactions themselves.
 */
export function useSolanaWalletProvider(): SolanaProvider | undefined {
  const { walletProvider } = useAppKitProvider<SolanaProvider>('solana')

  return walletProvider ?? undefined
}
