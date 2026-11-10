import { useFeatureFlags } from './useFeatureFlags'

/**
 * Whether Solana's wallet connector, chain and quotes are loaded. Beta counts as available on its
 * own, so Solana can ship behind `isSolanaBeta` without flipping `isSolanaEnabled` first.
 */
export function useIsSolanaAvailable(): boolean {
  const { isSolanaEnabled, isSolanaBeta } = useFeatureFlags()

  return !!isSolanaEnabled || !!isSolanaBeta
}
