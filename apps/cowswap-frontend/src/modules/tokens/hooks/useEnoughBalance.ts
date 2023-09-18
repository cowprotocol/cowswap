import { useMemo } from 'react'

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getAddress } from 'utils/getAddress'
import { isEnoughAmount } from 'utils/isEnoughAmount'

import { useBalancesAndAllowances } from './useBalancesAndAllowances'
import { useCurrencyBalances } from './useCurrencyBalance'

import { TokenAmounts } from '../types'

export interface UseEnoughBalanceParams {
  /**
   * Address of the account to check balance (and optionally the allowance). Undefined if the account is unknown, therefore we shouldn't do the check.
   */
  account: string | undefined

  /**
   * Amount against which to check balance (and optionally the allowance). Undefined if the amount is unknown, therefore we shouldn't do the check.
   */
  amount: CurrencyAmount<Currency> | undefined

  /**
   * Spender account to check the allowance for the given account. Undefined if the allowance is not required
   */
  spender: string | undefined
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params Parameters to check balance and optionally the allowance
 * @returns true if the account has enough balance (and allowance if it applies)
 */
export function useEnoughBalanceAndAllowance(params: UseEnoughBalanceParams): boolean | undefined {
  const { account, amount, spender } = params
  const isNativeCurrency = amount?.currency.isNative
  const token = amount?.currency.wrapped

  const { balances, allowances } = useBalancesAndAllowances({
    account,
    spender,
    tokens: !isNativeCurrency && account && token ? [token as Token] : [],
  })

  const native = useNativeCurrency()
  const [nativeBalance] = useCurrencyBalances(isNativeCurrency ? account : undefined, [native])

  return useMemo(() => {
    return hasEnoughBalanceAndAllowance({
      account,
      amount,
      balances,
      spender,
      allowances: spender ? allowances : undefined,
      nativeBalance,
    })
  }, [account, amount, balances, allowances, nativeBalance, spender])
}

export interface EnoughBalanceAndAllowanceParams extends UseEnoughBalanceParams {
  /**
   * Balances per token for the account
   */
  balances: TokenAmounts

  /**
   * Allowances per token for the account. Undefined if the allowances are not required for the check, so only the balance is checked.
   */
  allowances: TokenAmounts | undefined

  /**
   * Native balance for the account or undefined if it is unknown.
   */
  nativeBalance: CurrencyAmount<Currency> | undefined
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params Parameters to check balance and optionally the allowance
 * @returns true if the account has enough balance (and allowance if it applies)
 */
export function hasEnoughBalanceAndAllowance(params: EnoughBalanceAndAllowanceParams): boolean | undefined {
  const { account, amount, balances, nativeBalance, allowances } = params

  if (!account || !amount) {
    return undefined
  }

  const isNativeCurrency = amount?.currency.isNative
  const token = amount?.currency.wrapped
  const tokenAddress = getAddress(token)

  const enoughBalance = _enoughBalance(tokenAddress, amount, balances, isNativeCurrency, nativeBalance)
  const enoughAllowance = _enoughAllowance(tokenAddress, amount, allowances, isNativeCurrency)

  if (enoughBalance === undefined || enoughAllowance === undefined) {
    return undefined
  }

  return enoughBalance && enoughAllowance
}

function _enoughBalance(
  tokenAddress: string | null,
  amount: CurrencyAmount<Currency>,
  balances: TokenAmounts,
  isNativeCurrency: boolean,
  nativeBalance: CurrencyAmount<Currency> | undefined
): boolean | undefined {
  const balance = tokenAddress ? balances[tokenAddress]?.value : undefined
  const balanceAmount = isNativeCurrency ? nativeBalance : balance || undefined
  return isEnoughAmount(amount, balanceAmount)
}

function _enoughAllowance(
  tokenAddress: string | null,
  amount: CurrencyAmount<Currency>,
  allowances: TokenAmounts | undefined,
  isNativeCurrency: boolean
): boolean | undefined {
  if (!allowances || isNativeCurrency) {
    return true
  }

  if (!tokenAddress) {
    return undefined
  }

  const allowance = allowances[tokenAddress]?.value
  return allowance && isEnoughAmount(amount, allowance)
}
