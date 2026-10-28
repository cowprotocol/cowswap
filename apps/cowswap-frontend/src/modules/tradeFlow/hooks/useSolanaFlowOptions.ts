import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import type { SolanaFlowOptions } from '../services/solanaFlow'

interface Params {
  /**
   * Whether this surface can place a sponsored order at all. Only the swap flow can: `solanaFlow`
   * hands the sponsor to `planCreateOrderStep`, which a limit order never reaches, and a sponsored
   * bundle is signed and handed over rather than broadcast.
   */
  canSponsor?: boolean
}

export function useSolanaFlowOptions({ canSponsor = false }: Params = {}): SolanaFlowOptions {
  const { isSolanaSponsoredOrdersEnabled, isAtaCreationDisabled, isSolanaAppDataEnabled } = useFeatureFlags()

  return useMemo(
    () => ({
      isSponsored: canSponsor && Boolean(isSolanaSponsoredOrdersEnabled),
      isAtaCreationDisabled: Boolean(isAtaCreationDisabled),
      isSolanaAppDataEnabled: Boolean(isSolanaAppDataEnabled),
    }),
    [canSponsor, isSolanaSponsoredOrdersEnabled, isAtaCreationDisabled, isSolanaAppDataEnabled],
  )
}
