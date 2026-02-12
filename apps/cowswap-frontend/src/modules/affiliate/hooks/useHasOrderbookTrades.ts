import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { Address } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { checkIfTraderHasPastTrades } from '../api/checkIfTraderHasPastTrades'

interface UseHasOrderbookTradesParams {
  account?: Address
  enabled: boolean
}

interface UseHasOrderbookTradesResult {
  data?: boolean
  isLoading: boolean
  error?: Error
}

/**
 * Check if a trader has past trades using the cow api.
 */
export function useHasOrderbookTrades(params: UseHasOrderbookTradesParams): UseHasOrderbookTradesResult {
  const { account, enabled } = params

  return useSWR<boolean>(
    enabled ? ['affiliate-eligibility', account] : null,
    async () => (!account ? false : checkIfTraderHasPastTrades(account)),
    { refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL },
  )
}
