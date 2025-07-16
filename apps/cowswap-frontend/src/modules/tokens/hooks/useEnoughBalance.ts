import { useMemo } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { isEnoughAmount, getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTokensBalancesCombined } from 'modules/combinedBalances'

import { useTokenAllowance } from 'common/hooks/useTokenAllowance'

export interface UseEnoughBalanceParams {
  /**
   * Amount against which to check balance (and optionally the allowance)
   */
  amount: CurrencyAmount<Currency> | undefined
}

export type UseEnoughBalanceAndAllowanceResult = {
  enoughBalance: boolean | undefined
  enoughAllowance: boolean | undefined
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params UseEnoughBalanceParams to check balance and optionally the allowance
 * @returns UseEnoughBalanceAndAllowanceResult
 */
export function useEnoughBalanceAndAllowance({ amount }: UseEnoughBalanceParams): UseEnoughBalanceAndAllowanceResult {
  const { values: balances } = useTokensBalancesCombined()

  const currency = amount?.currency
  const token = useMemo(() => currency && getWrappedToken(currency), [currency])
  const allowance = useTokenAllowance(token).data

  return useMemo(() => {
    const enoughBalance = amount && hasEnoughBalance(token?.address, amount, balances)
    const enoughAllowance = amount && isEnoughAmount(amount, allowance)

    return {
      enoughBalance,
      enoughAllowance,
    }
  }, [amount, allowance, balances, token?.address])
}

function hasEnoughBalance(
  tokenAddress: string | undefined,
  amount: CurrencyAmount<Currency>,
  balances: BalancesState['values'],
): boolean | undefined {
  const balance = tokenAddress ? balances[tokenAddress.toLowerCase()] : undefined

  return isEnoughAmount(amount, balance)
}
