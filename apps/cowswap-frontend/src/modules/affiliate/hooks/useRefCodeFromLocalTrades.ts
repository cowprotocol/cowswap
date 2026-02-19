import { useMemo } from 'react'

import { Address } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrdersState } from 'legacy/state/orders/reducer'

import { extractFullAppDataFromOrder, getLocalTrades, getRefCodeFromAppData } from '../lib/affiliateProgramUtils'

export function useRefCodeFromLocalTrades(account: Address | undefined): string | undefined {
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)

  return useMemo(() => {
    const localTrades = getLocalTrades(account, ordersState)

    for (const order of localTrades) {
      const fullAppData = extractFullAppDataFromOrder(order)
      const code = getRefCodeFromAppData(fullAppData)

      if (code) return code
    }

    return undefined
  }, [account, ordersState])
}
