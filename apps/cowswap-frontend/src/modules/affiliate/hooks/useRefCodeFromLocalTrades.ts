import { useMemo } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrdersState } from 'legacy/state/orders/reducer'

import {
  extractFullAppDataFromOrder,
  getLocalTrades,
  getRefCodeFromAppData,
  isExecutedNonIntegratorOrder,
} from '../lib/affiliateProgramUtils'

export interface LocalTradeRefCode {
  /** Ref code recovered from the account's executed local trades, if any. */
  code?: string
  /** ISO creation time of the order that carries the code, used to tell a live link from a historical one. */
  linkedAt?: string
}

export function useRefCodeFromLocalTrades(account: Address | undefined): LocalTradeRefCode {
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)

  return useMemo(() => {
    const localTrades = getLocalTrades(account, ordersState).filter(isExecutedNonIntegratorOrder)

    let result: LocalTradeRefCode = {}

    for (const order of localTrades) {
      const fullAppData = extractFullAppDataFromOrder(order)
      const code = getRefCodeFromAppData(fullAppData)

      if (code) {
        result = { code, linkedAt: order.creationTime }
        break
      }
    }

    return result
  }, [account, ordersState])
}
