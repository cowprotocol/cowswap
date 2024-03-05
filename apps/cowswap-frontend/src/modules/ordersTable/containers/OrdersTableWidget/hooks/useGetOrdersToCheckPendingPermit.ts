import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { BalancesAndAllowances } from 'modules/tokens'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrdersTableList } from './useOrdersTableList'

import { getOrderParams } from '../../../utils/getOrderParams'
import { isParsedOrder } from '../../../utils/orderTableGroupUtils'

export function useGetOrdersToCheckPendingPermit(
  ordersList: OrdersTableList,
  chainId: SupportedChainId,
  balancesAndAllowances: BalancesAndAllowances
) {
  return useMemo(() => {
    // Pick only the pending orders
    return ordersList.pending.reduce((acc: ParsedOrder[], item) => {
      // Only do it for regular orders (not TWAP)
      if (isParsedOrder(item)) {
        const { hasEnoughAllowance } = getOrderParams(chainId, balancesAndAllowances, item)

        // Only if the order has not enough allowance
        if (hasEnoughAllowance === false) {
          acc.push(item)
        }
      }
      return acc
    }, [])
  }, [balancesAndAllowances, chainId, ordersList.pending])
}
