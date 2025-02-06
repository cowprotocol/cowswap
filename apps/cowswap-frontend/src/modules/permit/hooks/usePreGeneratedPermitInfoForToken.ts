import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PERMIT_TOKENS_BLACKLIST } from '@cowprotocol/permit-utils'

import { Nullish } from 'types'

import { usePreGeneratedPermitInfo } from './usePreGeneratedPermitInfo'

import { IsTokenPermittableResult } from '../types'

/**
 * Fetch pre-generated permit info for a single token
 */
export function usePreGeneratedPermitInfoForToken(token: Nullish<{ address: string; chainId: number }>): {
  permitInfo: IsTokenPermittableResult
  isLoading: boolean
} {
  const { allPermitInfo, isLoading } = usePreGeneratedPermitInfo()

  const address = token?.address.toLowerCase()
  const isBlackListed = Boolean(
    token && address && PERMIT_TOKENS_BLACKLIST[token.chainId as SupportedChainId]?.includes(address.toLowerCase()),
  )

  const permitInfo = address && !isBlackListed ? allPermitInfo[address] : undefined

  return useMemo(
    () => ({
      permitInfo,
      isLoading,
    }),
    [permitInfo, isLoading],
  )
}
