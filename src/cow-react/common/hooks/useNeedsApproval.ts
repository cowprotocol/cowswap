import { useWalletInfo } from '@cow/modules/wallet'
import { useTradeSpenderAddress } from '@cow/common/hooks/useTradeSpenderAddress'
import { useBalancesAndAllowances } from '@cow/modules/tokens'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { isEnoughAmount } from '@cow/utils/isEnoughAmount'
import { Nullish } from '@cow/types'

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

  return !isEnoughAmount(amount, allowance)
}
