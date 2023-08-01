import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getAddress } from 'utils/getAddress'
import { isEnoughAmount } from 'utils/isEnoughAmount'

import { useBalancesAndAllowances } from './useBalancesAndAllowances'
import { useCurrencyBalances } from './useCurrencyBalance'

import { TokenAmounts } from '../types'

export interface UseEnoughBalanceParams {
  /**
   * Address of the account to check balance (and optionally the allowance)
   */
  account?: string

  /**
   * Amount against which to check balance (and optionally the allowance)
   */
  amount?: CurrencyAmount<Currency>

  /**
   * Address of the account to check allowance. Set to undefined to skip allowance check.
   */
  checkAllowanceAddress?: string
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params Parameters to check balance and optionally the allowance
 * @returns true if the account has enough balance (and allowance if it applies)
 */
export function useEnoughBalanceAndAllowance(params: UseEnoughBalanceParams): boolean {
  const { account, amount, checkAllowanceAddress } = params
  const isNativeCurrency = amount?.currency.isNative
  const token = amount?.currency.wrapped

  const { balances, allowances } = useBalancesAndAllowances({
    account,
    spender: checkAllowanceAddress,
    tokens: !isNativeCurrency && account && token ? [token as Token] : [],
  })

  const native = useNativeCurrency()
  const [nativeBalance] = useCurrencyBalances(isNativeCurrency ? account : undefined, [native])

  return hasEnoughBalanceAndAllowance({
    ...params,
    balances,
    allowances: checkAllowanceAddress ? allowances : undefined,
    nativeBalance,
  })
}

export interface EnoughBalanceParams extends Omit<UseEnoughBalanceParams, 'checkAllowanceAddress'> {
  /**
   * Balances per token for the account
   */
  balances: TokenAmounts

  /**
   * Allowances per token for the account
   */
  allowances?: TokenAmounts

  /**
   * Native balance for the account
   */
  nativeBalance?: CurrencyAmount<Currency>
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params Parameters to check balance and optionally the allowance
 * @returns true if the account has enough balance (and allowance if it applies)
 */
export function hasEnoughBalanceAndAllowance(params: EnoughBalanceParams): boolean {
  const { account, amount, balances, nativeBalance, allowances } = params
  const isNativeCurrency = amount?.currency.isNative
  const token = amount?.currency.wrapped
  const tokenAddress = getAddress(token)

  const balance = tokenAddress ? balances[tokenAddress]?.value : undefined
  const allowance = (tokenAddress && allowances && allowances[tokenAddress]?.value) || undefined

  if (!account || !amount) {
    return false
  }

  const balanceAmount = isNativeCurrency ? nativeBalance : balance || undefined
  const enoughBalance = isEnoughAmount(amount, balanceAmount)
  const enoughAllowance = !allowances || isNativeCurrency || (allowance && isEnoughAmount(amount, allowance)) || false

  return enoughBalance && enoughAllowance
}
