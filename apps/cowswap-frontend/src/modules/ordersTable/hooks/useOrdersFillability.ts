import { useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { GenericOrder } from 'common/types'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
  hasPermit?: boolean
  order: GenericOrder
}

export function useOrdersFillability(orders: GenericOrder[]): Record<string, OrderFillability | undefined> {
  const { chainId } = useWalletInfo()
  const tokens = useMemo(() => orders.map((order) => order.inputToken.address.toLowerCase()), [orders])
  const { balances, allowances } = useBalancesAndAllowances(tokens)

  return useMemo(() => {
    return orders.reduce<Record<string, OrderFillability>>((acc, order) => {
      const inputTokenAddress = order.inputToken.address.toLowerCase()
      if (getIsNativeToken(chainId, inputTokenAddress)) {
        acc[order.id] = {
          hasEnoughBalance: true,
          hasEnoughAllowance: true,
          hasPermit: false,
          order,
        }
        return acc
      }

      const balance = balances[inputTokenAddress]
      const allowance = allowances?.[inputTokenAddress]
      const sellAmount = BigInt(order.sellAmount)

      acc[order.id] = {
        hasEnoughBalance: balance ? balance > sellAmount : undefined,
        hasEnoughAllowance: allowance ? allowance.gte(order.sellAmount) : undefined,
        hasPermit: doesOrderHavePermit(order),
        order,
      }

      return acc
    }, {})
  }, [orders, chainId, balances, allowances])
}
