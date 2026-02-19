import { ORDER_BOOK_API_UPDATE_INTERVAL } from '@cowprotocol/common-const'
import { Address } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { findRefCodeInPastTrades } from '../api/findRefCodeInPastTrades'

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

  return useSWR<string | undefined>(
    enabled ? ['affiliate-refCode-orderbook', account] : null,
    async () => (!account ? undefined : findRefCodeInPastTrades(account)),
    { refreshInterval: ORDER_BOOK_API_UPDATE_INTERVAL },
  )
}
