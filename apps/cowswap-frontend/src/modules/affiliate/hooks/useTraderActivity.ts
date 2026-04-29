import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR, { SWRResponse } from 'swr'

import { safeShortenAddress } from 'utils/address'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { TraderActivityRowResponse } from '../api/bffAffiliateApi.types'
import { AFFILIATE_STATS_REFRESH_INTERVAL_MS } from '../config/affiliateProgram.const'
import { logAffiliate } from '../utils/logger'

const EMPTY_ROWS: TraderActivityRowResponse[] = []

export function useTraderActivity(): SWRResponse<TraderActivityRowResponse[] | null, Error> {
  const { account } = useWalletInfo()

  return useSWR<TraderActivityRowResponse[] | null, Error>(
    account ? ['affiliate-trader-activity', account] : null,
    async () => {
      if (!account) return EMPTY_ROWS
      const response = await bffAffiliateApi.getTraderActivity(account)
      const rows = response?.rows ?? EMPTY_ROWS

      logAffiliate(safeShortenAddress(account), `Found ${rows.length} trader activity rows from BFF`)

      return rows
    },
    { refreshInterval: AFFILIATE_STATS_REFRESH_INTERVAL_MS },
  )
}
