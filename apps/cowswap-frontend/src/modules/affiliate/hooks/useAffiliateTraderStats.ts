import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { TraderStatsResponse } from '../api/bffAffiliateApi.types'
import { AFFILIATE_STATS_REFRESH_INTERVAL_MS } from '../config/affiliateProgram.const'

export function useAffiliateTraderStats(account?: string): SWRResponse<TraderStatsResponse | null, Error> {
  return useSWR<TraderStatsResponse | null, Error>(
    account ? ['affiliate-trader-stats', account] : null,
    async () => (!account ? null : bffAffiliateApi.getTraderStats(account)),
    { refreshInterval: AFFILIATE_STATS_REFRESH_INTERVAL_MS },
  )
}
