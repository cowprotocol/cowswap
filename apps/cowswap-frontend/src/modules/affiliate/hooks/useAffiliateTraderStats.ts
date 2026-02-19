import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { TraderStatsResponse } from 'modules/affiliate/lib/affiliateProgramTypes'

export function useAffiliateTraderStats(account?: string): SWRResponse<TraderStatsResponse | null, Error> {
  return useSWR<TraderStatsResponse | null, Error>(account ? ['affiliate-trader-stats', account] : null, async () =>
    !account ? null : bffAffiliateApi.getTraderStats(account),
  )
}
