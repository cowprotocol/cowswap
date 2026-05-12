import { useEffect, useMemo } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrdersState } from 'legacy/state/orders/reducer'

import { safeShortenAddress } from '../../../utils/address'
import { getLocalTrades, isExecutedNonIntegratorOrder } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

/**
 * Check if a trader has past trades in local state, to avoid additional api calls to cow api.
 */
export function useHasLocalTrades(account: Address | undefined): boolean {
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)

  const hasPastTrades = useMemo(() => {
    if (!account || !ordersState) return false

    const orders = getLocalTrades(account, ordersState).filter(isExecutedNonIntegratorOrder)
    return orders.length > 0
  }, [account, ordersState])

  useEffect(() => {
    if (account && hasPastTrades) {
      logAffiliate(safeShortenAddress(account), `Found trades in local state`)
    }
  }, [hasPastTrades, account])
  return hasPastTrades
}
