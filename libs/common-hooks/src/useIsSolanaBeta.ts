import { useFeatureFlags } from './useFeatureFlags'

/**
 * Whether Solana has moved from alpha to beta: the unaudited-risk surfaces and the alpha trade limits
 * are switched off, and the chain badge reads BETA instead of ALPHA.
 */
export function useIsSolanaBeta(): boolean {
  const { isSolanaBeta } = useFeatureFlags()

  return !!isSolanaBeta
}
