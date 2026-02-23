import { Address } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { findRefCodeInPastTrades } from '../api/findRefCodeInPastTrades'
import { AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS } from '../config/affiliateProgram.const'

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
    { refreshInterval: AFFILIATE_ORDERBOOK_REFRESH_INTERVAL_MS },
  )
}
