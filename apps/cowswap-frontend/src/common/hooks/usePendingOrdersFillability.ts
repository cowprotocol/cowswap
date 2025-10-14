import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { doesOrderHavePermit } from '../utils/doesOrderHavePermit'

export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
  hasPermit?: boolean
  order: Order
}

export function usePendingOrdersFillability(orderClass?: OrderClass): Record<string, OrderFillability | undefined> {
  const { chainId, account } = useWalletInfo()

  const pendingOrders = useOnlyPendingOrders(chainId, account)
  const tokens = pendingOrders.map((order) => order.sellToken.toLowerCase())

  const { balances, allowances } = useBalancesAndAllowances(tokens)

  return pendingOrders.reduce<Record<string, OrderFillability>>((acc, order) => {
    if (orderClass && order.class !== orderClass) return acc

    if (getIsNativeToken(chainId, order.inputToken.address)) {
      acc[order.id] = {
        hasEnoughBalance: true,
        hasEnoughAllowance: true,
        hasPermit: false,
        order,
      }
      return acc
    }

    const balance = balances[order.sellToken.toLowerCase()]
    const allowance = allowances?.[order.sellToken.toLowerCase()]

    acc[order.id] = {
      hasEnoughBalance: balance ? balance.gte(order.sellAmount) : undefined,
      hasEnoughAllowance: allowance ? allowance.gte(order.sellAmount) : undefined,
      hasPermit: doesOrderHavePermit(order),
      order,
    }

    return acc
  }, {})
}
