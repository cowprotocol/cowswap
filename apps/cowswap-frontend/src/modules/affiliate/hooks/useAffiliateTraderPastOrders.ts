import { Address } from '@cowprotocol/cow-sdk'
import { isSolanaAddress } from '@cowprotocol/sdk-common'

import useSWR, { SWRResponse } from 'swr'

import { useAffiliateSupportedChainIds } from './useAffiliateSupportedChainIds'

import { checkIfTraderHasPastTrades, PastTradesCheckResult } from '../api/checkIfTraderHasPastTrades'
import { AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS } from '../config/affiliateProgram.const'

interface UseAffiliateTraderPastOrdersParams {
  account?: Address
  enabled: boolean
}

const EMPTY_RESULT: PastTradesCheckResult = {
  hasPastTrades: false,
  refCode: undefined,
}

export function useAffiliateTraderPastOrders(
  params: UseAffiliateTraderPastOrdersParams,
): SWRResponse<PastTradesCheckResult, Error> {
  const { account, enabled } = params
  const supportedChainIds = useAffiliateSupportedChainIds()

  return useSWR<PastTradesCheckResult>(
    enabled && !!account && !isSolanaAddress(account)
      ? ['affiliate-orderbook-trades-check', account, supportedChainIds]
      : null,
    async () => (!account ? EMPTY_RESULT : checkIfTraderHasPastTrades(account, supportedChainIds)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS,
      refreshInterval: AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS,
      revalidateIfStale: true,
      revalidateOnMount: true,
    },
  )
}
