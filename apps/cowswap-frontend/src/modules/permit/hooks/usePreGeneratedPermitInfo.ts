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
  allPermitInfo: Record<string, PermitInfo | undefined>
  isLoading: boolean
} {
  const { chainId } = useWalletInfo()

  const url = `${PRE_GENERATED_PERMIT_URL}.${chainId}.json`

  const { data, isLoading } = useSWR(
    url,
    (url: string): Promise<Record<string, PermitInfo | undefined>> =>
      fetch(url)
        .then((r) => r.json())
        .then(migrateData),
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: {} }
  )

  return { allPermitInfo: data, isLoading }
}

type OldPermitInfo = PermitInfo | false

const UNSUPPORTED: PermitInfo = { type: 'unsupported' }

/**
 * Handles data migration from former way of storing unsupported tokens to the new one
 */
function migrateData(data: Record<string, OldPermitInfo>): Record<string, PermitInfo> {
  const migrated: Record<string, PermitInfo> = {}

  for (const [k, v] of Object.entries(data)) {
    if (v === false) {
      migrated[k] = UNSUPPORTED
    } else {
      migrated[k] = v
    }
  }

  return migrated
}
