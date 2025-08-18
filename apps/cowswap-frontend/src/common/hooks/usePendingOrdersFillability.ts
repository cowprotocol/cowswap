import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'


export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
}

export function usePendingOrdersFillability(): Record<string, OrderFillability | undefined> {
  const { chainId, account } = useWalletInfo()

  const pendingOrders = useOnlyPendingOrders(chainId, account)
  const tokens = pendingOrders.map((order) => order.sellToken.toLowerCase())

  const { balances, allowances } = useBalancesAndAllowances(tokens)

  return pendingOrders.reduce<Record<string, OrderFillability>>((acc, order) => {
    const balance = balances[order.sellToken.toLowerCase()]
    const allowance = allowances?.[order.sellToken.toLowerCase()]

    acc[order.id] = {
      hasEnoughBalance: balance ? balance.gte(order.sellAmount) : undefined,
      hasEnoughAllowance: allowance ? allowance.gte(order.sellAmount) : undefined,
    }

    return acc
  }, {})
}
