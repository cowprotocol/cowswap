import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { TraderInfoResponse } from '../api/bffAffiliateApi.types'

export function useAffiliateTraderInfo(code?: string): SWRResponse<TraderInfoResponse | null, Error> {
  return useSWR<TraderInfoResponse | null, Error>(
    //
    code ? ['affiliate-trader-info', code] : null,
    async () => (!code ? null : bffAffiliateApi.getTraderInfo(code)),
  )
}
