import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { getAddress } from 'utils/getAddress'
import { isEnoughAmount } from 'utils/isEnoughAmount'

import { useBalancesAndAllowances } from './useBalancesAndAllowances'
import { useCurrencyBalances } from './useCurrencyBalance'

import { TokenAmounts } from '../types'

export interface UseEnoughBalanceParams {
  account?: string
  amount?: CurrencyAmount<Currency>
  checkAllowanceAddress?: string
}

export function useEnoughBalance(params: UseEnoughBalanceParams): boolean {
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

  return hasEnoughBalance({
    ...params,
    balances,
    allowances: checkAllowanceAddress ? allowances : undefined,
    nativeBalance,
  })
}

export interface EnoughBalanceParams extends Omit<UseEnoughBalanceParams, 'checkAllowanceAddress'> {
  balances: TokenAmounts
  allowances?: TokenAmounts
  nativeBalance?: CurrencyAmount<Currency>
}

export function hasEnoughBalance(params: EnoughBalanceParams): boolean {
  const { account, amount, balances, nativeBalance, allowances } = params
  const isNativeCurrency = amount?.currency.isNative
  const token = amount?.currency.wrapped
  const tokenAddress = getAddress(token)

  const balance = tokenAddress && balances[tokenAddress]?.value
  const allowance = tokenAddress && allowances && allowances[tokenAddress]?.value

  if (!account || !amount) {
    return false
  }

  const balanceAmount = isNativeCurrency
    ? nativeBalance
    : (balance && typeof balance !== 'string' && balance) || undefined
  const enoughBalance = isEnoughAmount(amount, balanceAmount)
  const enoughAllowance = (allowance && typeof allowance !== 'string' && isEnoughAmount(amount, allowance)) || false

  return enoughBalance && (allowances === undefined || enoughAllowance)
}
