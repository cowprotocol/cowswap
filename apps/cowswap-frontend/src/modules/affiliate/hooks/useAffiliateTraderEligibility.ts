import { useEffect, useMemo, useState } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { useHasLocalTrades } from './useHasLocalTrades'
import { useHasOrderbookTrades } from './useHasOrderbookTrades'

import { AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS } from '../config/affiliateProgram.const'

export enum TraderEligibilityStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
  HAS_PAST_TRADES = 'has-past-trades',
  NO_PAST_TRADES = 'no-past-trades',
}

export interface TraderEligibilityState {
  status: TraderEligibilityStatus
  hasLoadingTimeout: boolean
}

interface UseAffiliateTraderEligibilityParams {
  account?: Address
  enabled?: boolean
}

/**
 * Check whether a trader has past trades for affiliate eligibility.
 *
 * Resolution order:
 * 1. Check local trades state first.
 * 2. If none found locally, query Orderbook.
 *
 * The hook also returns a loading-timeout flag so the UI can show degraded-state messaging
 * when the Orderbook check takes longer than expected.
 */
export function useAffiliateTraderEligibility(params: UseAffiliateTraderEligibilityParams): TraderEligibilityState {
  const { account, enabled = true } = params
  const isEnabled = Boolean(enabled && account)
  const hasLocalTrades = useHasLocalTrades(account)
  const shouldFetchOrderbook = isEnabled && !hasLocalTrades
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false)

  const {
    data: hasOrderbookTrades,
    error,
    isLoading,
  } = useHasOrderbookTrades({ account, enabled: shouldFetchOrderbook })

  const status = useMemo(() => {
    if (!isEnabled) {
      return TraderEligibilityStatus.IDLE
    }

    if (hasLocalTrades) {
      return TraderEligibilityStatus.HAS_PAST_TRADES
    }

    if (isLoading || hasOrderbookTrades === undefined) {
      return TraderEligibilityStatus.LOADING
    }

    if (error) {
      return TraderEligibilityStatus.ERROR
    }

    if (hasOrderbookTrades) {
      return TraderEligibilityStatus.HAS_PAST_TRADES
    }

    return TraderEligibilityStatus.NO_PAST_TRADES
  }, [error, hasLocalTrades, hasOrderbookTrades, isEnabled, isLoading])

  useEffect(() => {
    const isLoadingEligibility = shouldFetchOrderbook && status === TraderEligibilityStatus.LOADING

    if (!isLoadingEligibility) {
      setHasLoadingTimeout(false)
      return
    }

    setHasLoadingTimeout(false)
    const timer = setTimeout(() => {
      setHasLoadingTimeout(true)
    }, AFFILIATE_ELIGIBILITY_LOADING_WARNING_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [shouldFetchOrderbook, status])

  return useMemo(
    () => ({
      status,
      hasLoadingTimeout,
    }),
    [hasLoadingTimeout, status],
  )
}
