import { getWrappedToken, isEnoughAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

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
export function useNeedsApproval(amount: Nullish<CurrencyAmount<Currency>>): boolean {
  const spender = useTradeSpenderAddress()
  const token = amount ? getWrappedToken(amount.currency) : undefined
  const allowance = useTokenAllowance(token).data

  if (typeof allowance === 'undefined') {
    return true
  }

  if (!token || !amount || !spender) {
    return false
  }

  return isEnoughAmount(amount, allowance) === false
}
