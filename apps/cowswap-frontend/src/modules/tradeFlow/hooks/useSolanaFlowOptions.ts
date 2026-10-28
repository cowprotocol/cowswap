import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import type { SolanaFlowOptions } from '../services/solanaFlow'

export function useSolanaFlowOptions(): SolanaFlowOptions {
  const { isSolanaSponsoredOrdersEnabled, isAtaCreationDisabled, isSolanaAppDataEnabled } = useFeatureFlags()

  return useMemo(
    () => ({
      isSponsored: Boolean(isSolanaSponsoredOrdersEnabled),
      isAtaCreationDisabled: Boolean(isAtaCreationDisabled),
      isSolanaAppDataEnabled: Boolean(isSolanaAppDataEnabled),
    }),
    [isSolanaSponsoredOrdersEnabled, isAtaCreationDisabled, isSolanaAppDataEnabled],
  )
}
