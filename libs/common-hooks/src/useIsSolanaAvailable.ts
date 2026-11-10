import { useFeatureFlags } from './useFeatureFlags'

/**
 * Whether Solana's wallet connector, chain and quotes are loaded.
 */
export function useIsSolanaAvailable(): boolean {
  const { isSolanaEnabled } = useFeatureFlags()

  return !!isSolanaEnabled
}
