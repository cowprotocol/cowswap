import { useFeatureFlags } from './useFeatureFlags'

/**
 * Whether Solana has left its alpha launch: the unaudited-risk surfaces and the alpha trade limits
 * are switched off, and the chain badge reads NEW instead of ALPHA.
 */
export function useIsSolanaPublicLaunched(): boolean {
  const { isSolanaPublicLaunched } = useFeatureFlags()

  return !!isSolanaPublicLaunched
}
