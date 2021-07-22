import { parseUnits } from 'ethers/lib/utils'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { t } from '@lingui/macro'

export const MINIMUM_TXS = '10'
export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

export const _setNativeLowBalanceError = (nativeSymbol: string) =>
  new Error(
    t`This ${nativeSymbol} wrapping operation may leave insufficient funds to cover any future on-chain transaction costs.`
  )

export function _isLowBalanceCheck({
  threshold,
  txCost,
  nativeInput,
  balance,
}: {
  threshold: CurrencyAmount<Currency>
  txCost: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  balance?: CurrencyAmount<Currency>
}) {
  if (!nativeInput || !balance || nativeInput.add(txCost).greaterThan(balance)) return true
  // OK if: users_balance - (amt_input + 1_tx_cost) > low_balance_threshold
  return balance.subtract(nativeInput.add(txCost)).lessThan(threshold)
}

export const _getAvailableTransactions = ({
  nativeBalance,
  nativeInput,
  singleTxCost,
}: {
  nativeBalance?: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  singleTxCost: CurrencyAmount<Currency>
}) => {
  if (!nativeBalance || !nativeInput || nativeBalance.lessThan(nativeInput.add(singleTxCost))) return null

  // USER_BALANCE - (USER_WRAP_AMT + 1_TX_CST) / 1_TX_COST = AVAILABLE_TXS
  const txsAvailable = nativeBalance.subtract(nativeInput.add(singleTxCost)).divide(singleTxCost)
  return txsAvailable.lessThan('1') ? null : txsAvailable.toSignificant(1)
}
