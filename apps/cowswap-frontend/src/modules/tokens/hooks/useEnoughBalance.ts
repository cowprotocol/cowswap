import { AllowancesState, BalancesState, useTokensAllowances } from '@cowprotocol/balances-and-allowances'
import { isEnoughAmount, getAddress, getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTokensBalancesCombined } from 'modules/combinedBalances'

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

export type UseEnoughBalanceAndAllowanceResult = {
  enoughBalance: boolean | undefined
  enoughAllowance: boolean | undefined
}

const DEFAULT_BALANCE_AND_ALLOWANCE = { enoughBalance: undefined, enoughAllowance: undefined }

/**
 * Check if the account has enough balance and optionally allowance
 * @param params UseEnoughBalanceParams to check balance and optionally the allowance
 * @returns UseEnoughBalanceAndAllowanceResult
 */
export function useEnoughBalanceAndAllowance(params: UseEnoughBalanceParams): UseEnoughBalanceAndAllowanceResult {
  const { checkAllowanceAddress } = params

  const { values: balances } = useTokensBalancesCombined()
  const { values: allowances } = useTokensAllowances()

  return hasEnoughBalanceAndAllowance({
    ...params,
    balances,
    allowances: checkAllowanceAddress ? allowances : undefined,
  })
}

export interface EnoughBalanceParams extends Omit<UseEnoughBalanceParams, 'checkAllowanceAddress'> {
  /**
   * Balances per token for the account
   */
  balances: BalancesState['values']

  /**
   * Allowances per token for the account
   */
  allowances?: AllowancesState['values']
}

/**
 * Check if the account has enough balance and optionally allowance
 * @param params Parameters to check balance and optionally the allowance
 * @returns true if the account has enough balance (and allowance if it applies)
 */
export function hasEnoughBalanceAndAllowance(params: EnoughBalanceParams): UseEnoughBalanceAndAllowanceResult {
  const { account, amount, balances, allowances } = params

  if (!account || !amount) {
    return DEFAULT_BALANCE_AND_ALLOWANCE
  }

  const isNativeCurrency = !!amount?.currency && getIsNativeToken(amount?.currency)
  const token = amount?.currency && getWrappedToken(amount.currency)
  const tokenAddress = getAddress(token)?.toLowerCase()

  const enoughBalance = _enoughBalance(tokenAddress, amount, balances)
  const enoughAllowance = _enoughAllowance(tokenAddress, amount, allowances, isNativeCurrency)

  return { enoughBalance, enoughAllowance }
}

function _enoughBalance(
  tokenAddress: string | undefined,
  amount: CurrencyAmount<Currency>,
  balances: BalancesState['values'],
): boolean | undefined {
  const balance = tokenAddress ? balances[tokenAddress] : undefined

  return isEnoughAmount(amount, balance)
}

function _enoughAllowance(
  tokenAddress: string | undefined,
  amount: CurrencyAmount<Currency>,
  allowances: AllowancesState['values'] | undefined,
  isNativeCurrency: boolean,
): boolean | undefined {
  if (!tokenAddress || !allowances) {
    return undefined
  }
  if (isNativeCurrency) {
    return true
  }
  const allowance = allowances[tokenAddress]

  return allowance && isEnoughAmount(amount, allowance)
}
