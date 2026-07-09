import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getWrappedToken, isEnoughAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { useTokenAllowance } from './useTokenAllowance'

/**
 * Hook to check if a token needs approval
 *
 * Spender address is GP_VAULT_RELAYER_ADDRESS
 *
 * If any input param is missing, returns false
 * If no allowance is found, returns true
 * If allowance is found and is sufficient, returns false
 * If allowance is found and is insufficient, returns true
 *
 * @param amount
 * @returns {boolean}
 */
export function useNeedsApproval(amount: Nullish<CurrencyAmount<Currency>>, spender?: string): boolean {
  const tradeSpender = useTradeSpenderAddress()
  const token = amount ? getWrappedToken(amount.currency) : undefined
  const approvalSpender = spender ?? tradeSpender
  const allowance = useTokenAllowance(token, undefined, approvalSpender)

  if (!token || !amount || !approvalSpender) {
    return false
  }

  if (allowance.data === undefined) {
    return true
  }

  return isEnoughAmount(amount, allowance.data) === false
}
