import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useBalancesAndAllowances, useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getOptimisticAllowanceKey } from 'entities/optimisticAllowance/getOptimisticAllowanceKey'
import { optimisticAllowancesAtom } from 'entities/optimisticAllowance/optimisticAllowancesAtom'

import { GenericOrder } from 'common/types'
import { doesOrderHavePermit } from 'common/utils/doesOrderHavePermit'

export interface OrderFillability {
  hasEnoughAllowance: boolean | undefined
  hasEnoughBalance: boolean | undefined
  hasPermit?: boolean
  order: GenericOrder
}

function getEffectiveAllowance(
  onChainAllowance: bigint | undefined,
  optimisticAmount: bigint | undefined,
): bigint | undefined {
  if (optimisticAmount === undefined) return onChainAllowance
  if (onChainAllowance !== undefined && onChainAllowance > optimisticAmount) return onChainAllowance
  return optimisticAmount
}

function getOrderFillability(
  order: GenericOrder,
  chainId: number,
  account: string | undefined,
  spender: string | undefined,
  balances: Record<string, bigint | undefined>,
  allowances: Record<string, bigint | undefined>,
  optimisticAllowances: Record<string, { amount: bigint }>,
): OrderFillability {
  const inputTokenAddress = order.inputToken.address.toLowerCase()
  if (getIsNativeToken(chainId, inputTokenAddress)) {
    return { hasEnoughBalance: true, hasEnoughAllowance: true, hasPermit: false, order }
  }

  const balance = balances[inputTokenAddress]
  const onChainAllowance = allowances[inputTokenAddress]
  const optimisticKey =
    account && spender
      ? getOptimisticAllowanceKey({
          chainId,
          tokenAddress: getAddressKey(order.inputToken.address),
          owner: account,
          spender,
        })
      : null
  const optimistic = optimisticKey ? optimisticAllowances[optimisticKey] : undefined
  const allowance = getEffectiveAllowance(onChainAllowance, optimistic?.amount)
  const sellAmount = BigInt(order.sellAmount)

  return {
    hasEnoughBalance: balance ? balance > sellAmount : undefined,
    hasEnoughAllowance: allowance !== undefined ? allowance > sellAmount : undefined,
    hasPermit: doesOrderHavePermit(order),
    order,
  }
}

export function useOrdersFillability(orders: GenericOrder[]): Record<string, OrderFillability | undefined> {
  const { chainId, account } = useWalletInfo()
  const spender = useTradeSpenderAddress()
  const tokens = useMemo(() => orders.map((order) => order.inputToken.address.toLowerCase()), [orders])
  const { balances, allowances } = useBalancesAndAllowances(tokens)
  const optimisticAllowances = useAtomValue(optimisticAllowancesAtom)

  return useMemo(() => {
    return orders.reduce<Record<string, OrderFillability>>((acc, order) => {
      acc[order.id] = getOrderFillability(
        order,
        chainId,
        account,
        spender,
        balances,
        allowances ?? {},
        optimisticAllowances,
      )
      return acc
    }, {})
  }, [orders, chainId, account, spender, balances, allowances, optimisticAllowances])
}
