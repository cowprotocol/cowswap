import { useMemo } from 'react'

import { Nullish } from 'types'

import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { IsTokenPermittableResult } from '../types'

/**
 * Fetch pre-generated permit info for a single token
 */
export function usePreGeneratedPermitInfoForToken(token: Nullish<{ address: string }>): {
  permitInfo: IsTokenPermittableResult
  isLoading: boolean
} {
  const { allPermitInfo, isLoading } = usePreGeneratedPermitInfo()

  const address = token?.address.toLowerCase()

  const permitInfo = address ? allPermitInfo[address] : undefined

  return useMemo(
    () => ({
      permitInfo,
      isLoading,
    }),
    [permitInfo, isLoading]
  )
}
