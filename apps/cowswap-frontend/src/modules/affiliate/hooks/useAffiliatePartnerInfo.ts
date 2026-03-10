import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { PartnerInfoResponse } from '../api/bffAffiliateApi.types'

export function useAffiliatePartnerInfo(account: string | undefined): SWRResponse<PartnerInfoResponse | null, Error> {
  return useSWR<PartnerInfoResponse | null, Error>(
    //
    account ? ['affiliate-partner-info', account] : null,
    async () => (!account ? null : bffAffiliateApi.getPartnerInfo(account)),
  )
}
