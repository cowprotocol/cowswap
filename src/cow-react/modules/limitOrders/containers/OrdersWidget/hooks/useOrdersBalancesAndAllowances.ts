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

  // TODO: refactor useTokenBalancesWithLoadingIndicator() hook and add ListenerOptions
  const [balances] = useTokenBalancesWithLoadingIndicator(account, tokens)
  const { allowances } = useTokensAllowances(account, spender, tokens, { blocksPerFetch: 25 })

  return useMemo(() => ({ balances, allowances }), [balances, allowances])
}
