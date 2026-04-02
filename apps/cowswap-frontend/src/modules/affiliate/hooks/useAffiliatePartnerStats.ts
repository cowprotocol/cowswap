import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { PartnerStatsResponse } from '../api/bffAffiliateApi.types'
import { AFFILIATE_STATS_REFRESH_INTERVAL_MS } from '../config/affiliateProgram.const'

export function useAffiliatePartnerStats(
  account?: string,
  refCode?: string,
): SWRResponse<PartnerStatsResponse | null, Error> {
  return useSWR<PartnerStatsResponse | null, Error>(
    account && refCode ? ['affiliate-partner-stats', account, refCode] : null,
    async () => (!account || !refCode ? null : bffAffiliateApi.getAffiliateStats(account)),
    { refreshInterval: AFFILIATE_STATS_REFRESH_INTERVAL_MS },
  )
}
