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
export function useEnoughBalanceAndAllowance(params: UseEnoughBalanceParams): boolean | undefined {
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
export function hasEnoughBalanceAndAllowance(params: EnoughBalanceParams): boolean | undefined {
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
  if (!tokenAddress || !allowances) {
    return undefined
  }
  if (isNativeCurrency) {
    return true
  }
  const allowance = allowances[tokenAddress]?.value
  return allowance && isEnoughAmount(amount, allowance)
}
