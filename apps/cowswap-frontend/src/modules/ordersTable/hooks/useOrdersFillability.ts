import { useMemo } from 'react'

import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { GenericOrder } from 'common/types'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'
import { getIsAllowanceDeferredToSettlement } from 'utils/orderUtils/getIsAllowanceDeferredToSettlement'
import { getOrderFundingTokenAddress } from 'utils/orderUtils/getOrderFundingTokenAddress'

export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
  hasPermit?: boolean
  order: GenericOrder
}

export function useOrdersFillability(orders: GenericOrder[]): Record<string, OrderFillability | undefined> {
  const { chainId } = useWalletInfo()
  const tokens = useMemo(() => orders.map((order) => getAddressKey(order.inputToken.address)), [orders])
  const { balances, allowances } = useBalancesAndAllowances(tokens)

  return useMemo(() => {
    return orders.reduce<Record<string, OrderFillability>>((acc, order) => {
      const inputTokenAddress = getAddressKey(order.inputToken.address)
      if (getIsNativeToken(chainId, inputTokenAddress)) {
        acc[order.id] = {
          hasEnoughBalance: true,
          hasEnoughAllowance: true,
          hasPermit: false,
          order,
        }
        return acc
      }

      const balance = balances[getAddressKey(getOrderFundingTokenAddress(chainId, order))]
      const allowance = allowances[inputTokenAddress]
      const sellAmount = order.sellAmount !== undefined ? BigInt(order.sellAmount) : undefined
      const hasEnoughAllowance =
        allowance !== undefined && sellAmount !== undefined ? allowance >= sellAmount : undefined

      acc[order.id] = {
        hasEnoughBalance: balance !== undefined && sellAmount !== undefined ? balance >= sellAmount : undefined,
        hasEnoughAllowance: getIsAllowanceDeferredToSettlement(order) ? true : hasEnoughAllowance,
        hasPermit: doesOrderHavePermit(order),
        order,
      }

      return acc
    }, {})
  }, [orders, chainId, balances, allowances])
}
