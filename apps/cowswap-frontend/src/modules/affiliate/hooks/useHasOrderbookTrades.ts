import { Address } from '@cowprotocol/cow-sdk'

import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'

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

  const { data, isLoading, error } = useAffiliateTraderPastOrders({ account, enabled })

  return {
    data: data?.hasPastTrades,
    isLoading,
    error,
  }
}
