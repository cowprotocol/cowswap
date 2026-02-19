import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { PartnerStatsResponse } from '../lib/affiliateProgramTypes'

export function useAffiliatePartnerStats(
  account?: string,
  refCode?: string,
): SWRResponse<PartnerStatsResponse | null, Error> {
  return useSWR<PartnerStatsResponse | null, Error>(
    account && refCode ? ['affiliate-partner-stats', account, refCode] : null,
    async () => (!account || !refCode ? null : bffAffiliateApi.getAffiliateStats(account)),
  )
}
