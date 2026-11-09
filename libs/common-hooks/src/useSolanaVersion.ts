import { isSolanaBetaOrHigher, parseSolanaVersion, SolanaVersion } from '@cowprotocol/common-const'

import { useFeatureFlags } from './useFeatureFlags'

export function useIsSolanaBetaOrHigher(): boolean {
  const version = useSolanaVersion()

  return isSolanaBetaOrHigher(version)
}

export function useSolanaVersion(): SolanaVersion {
  const { solanaVersion } = useFeatureFlags()

  return parseSolanaVersion(solanaVersion)
}
