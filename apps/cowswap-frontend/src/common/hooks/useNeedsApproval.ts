import { isEnoughAmount } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useBalancesAndAllowances } from 'modules/tokens'

import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

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
  const { account } = useWalletInfo()
  const spender = useTradeSpenderAddress()
  const token = amount?.currency.wrapped
  const tokens = token ? [token] : []
  const balancesAndAllowances = useBalancesAndAllowances({ account, spender, tokens })

  const { allowances } = balancesAndAllowances

  const allowance = token && allowances[token.address]?.value

  if (!allowance) {
    return true
  }
  if (!token || !amount || !spender) {
    return false
  }

  return isEnoughAmount(amount, allowance) === false
}
