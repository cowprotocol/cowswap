import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { PermitInfo } from '@cowprotocol/permit-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { PRE_GENERATED_PERMIT_URL } from '../const'

/**
 * Fetch pre-generated permit info (stored in token-lists repo) for all tokens
 *
 * Caches result with SWR until a page refresh
 */
export function usePreGeneratedPermitInfo(): {
  allPermitInfo: Record<string, PermitInfo>
  isLoading: boolean
} {
  const { chainId } = useWalletInfo()

  const url = `${PRE_GENERATED_PERMIT_URL}.${chainId}.json`

  const { data, isLoading } = useSWR(
    url,
    (url: string): Promise<Record<string, PermitInfo>> => fetch(url).then((r) => r.json()),
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: {} }
  )

  return useMemo(() => ({ allPermitInfo: data, isLoading }), [data, isLoading])
}
