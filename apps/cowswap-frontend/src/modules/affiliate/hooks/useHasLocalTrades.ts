import { useEffect, useMemo } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrdersState } from 'legacy/state/orders/reducer'

import { safeShortenAddress } from '../../../utils/address'
import { getLocalTrades } from '../lib/affiliateProgramUtils'
import { logAffiliate } from '../utils/logger'

/**
 * Check if a trader has past trades in local state, to avoid additional api calls to cow api.
 */
export function useHasLocalTrades(account: Address | undefined): boolean {
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)

  const hasPastTrades = useMemo(() => {
    return getLocalTrades(account, ordersState).length > 0
  }, [account, ordersState])

  useEffect(() => {
    if (account && hasPastTrades) {
      logAffiliate(safeShortenAddress(account), 'Found past trades in local orders')
    }
  }, [account, hasPastTrades])

  return hasPastTrades
}
