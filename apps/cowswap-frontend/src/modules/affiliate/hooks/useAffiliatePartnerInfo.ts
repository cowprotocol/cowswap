import useSWR, { SWRResponse } from 'swr'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import { PartnerInfoResponse } from 'modules/affiliate/lib/affiliateProgramTypes'

export function useAffiliatePartnerInfo(account: string | undefined): SWRResponse<PartnerInfoResponse | null, Error> {
  return useSWR<PartnerInfoResponse | null, Error>(
    //
    account ? ['affiliate-partner-info', account] : null,
    async () => (!account ? null : bffAffiliateApi.getPartnerInfo(account)),
  )
}
