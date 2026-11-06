import { useFeatureFlags } from './useFeatureFlags'

/**
 * Whether Solana's wallet connector, chain and quotes are loaded. Ignores the user's alpha networks opt-in,
 * which only decides whether Solana is listed, so direct Solana links keep working without it.
 */
export function useIsSolanaAvailable(): boolean {
  const { isSolanaEnabled, isAlphaNetworksOptionVisible } = useFeatureFlags()

  return !!isSolanaEnabled || !!isAlphaNetworksOptionVisible
}
