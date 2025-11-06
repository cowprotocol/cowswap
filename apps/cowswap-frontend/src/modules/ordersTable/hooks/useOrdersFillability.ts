import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'

import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
  hasPermit?: boolean
  order: Order
}

export function useOrdersFillability(orders: Order[]): Record<string, OrderFillability | undefined> {
  const { chainId } = useWalletInfo()
  const tokens = orders.map((order) => order.sellToken.toLowerCase())

  const { balances, allowances } = useBalancesAndAllowances(tokens)

  return orders.reduce<Record<string, OrderFillability>>((acc, order) => {
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

