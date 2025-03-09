import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { getWrappedToken } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from 'modules/trade'

export function useHasEnoughWrappedBalanceForSwap(): boolean {
  const derivedTradeState = useDerivedTradeState()
  const { inputCurrency, inputCurrencyAmount } = derivedTradeState || {}

  const wrappedBalance = useCurrencyAmountBalance(inputCurrency ? getWrappedToken(inputCurrency) : undefined)

  // is a native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputCurrencyAmount && !wrappedBalance.lessThan(inputCurrencyAmount))
}
