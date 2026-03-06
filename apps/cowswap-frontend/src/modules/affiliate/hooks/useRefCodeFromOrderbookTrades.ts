import { Address } from '@cowprotocol/cow-sdk'

import { useAffiliateTraderPastOrders } from './useAffiliateTraderPastOrders'

interface UseRefCodeFromOrderbookTradesParams {
  account?: Address
  enabled: boolean
}

interface UseRefCodeFromOrderbookTradesResult {
  data?: string
  isLoading: boolean
  error?: Error
}

export function useRefCodeFromOrderbookTrades(
  params: UseRefCodeFromOrderbookTradesParams,
): UseRefCodeFromOrderbookTradesResult {
  const { account, enabled } = params

  const { data, isLoading, error } = useAffiliateTraderPastOrders({ account, enabled })

  return {
    data: data?.refCode,
    isLoading,
    error,
  }
}
