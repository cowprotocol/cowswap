import { Order } from 'state/orders/actions'
import { useTokenBalancesWithLoadingIndicator } from 'lib/hooks/useCurrencyBalance'
import { Allowances, useTokensAllowances } from '@cow/common/hooks/useTokensAllowances'
import { useMemo } from 'react'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export type Balances = {
  [tokenAddress: string]: CurrencyAmount<Token> | undefined
}

export interface BalancesAndAllowances {
  balances: Balances
  allowances: Allowances
}

export function useOrdersBalancesAndAllowances(
  account: string | undefined,
  spender: string | undefined,
  orders: Order[]
): BalancesAndAllowances {
  const tokens = useMemo(() => {
    return orders.map((order) => order.inputToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.map((order) => order.sellToken).join('')])

  const [balances] = useTokenBalancesWithLoadingIndicator(account, tokens)
  const { allowances } = useTokensAllowances(account, spender, tokens)

  return useMemo(() => ({ balances, allowances }), [balances, allowances])
}
