import { parseUnits } from 'ethers/lib/utils'
import { CurrencyAmount } from '@uniswap/sdk'

export const MINIMUM_TXS = '10'
export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

export const _setNativeLowBalanceError = (nativeSymbol: string) =>
  new Error(
    `This ${nativeSymbol} wrapping operation may leave insufficient funds to cover any future on-chain transaction costs.`
  )

export function _isLowBalanceCheck({
  threshold,
  txCost,
  userInput,
  balance
}: {
  threshold: CurrencyAmount
  txCost: CurrencyAmount
  userInput?: CurrencyAmount
  balance?: CurrencyAmount
}) {
  if (!userInput || !balance || userInput.add(txCost).greaterThan(balance)) return true
  // OK if: users_balance - (amt_input + 1_tx_cost) > low_balance_threshold
  return balance.subtract(userInput.add(txCost)).lessThan(threshold)
}

export const _getAvailableTransactions = ({
  nativeBalance,
  userInput,
  singleTxCost
}: {
  nativeBalance?: CurrencyAmount
  userInput?: CurrencyAmount
  singleTxCost: CurrencyAmount
}) => {
  if (!nativeBalance || !userInput || nativeBalance.lessThan(userInput.add(singleTxCost))) return null

  // USER_BALANCE - (USER_WRAP_AMT + 1_TX_CST) / 1_TX_COST = AVAILABLE_TXS
  const txsAvailable = nativeBalance.subtract(userInput.add(singleTxCost)).divide(singleTxCost)
  return txsAvailable.lessThan('1') ? null : txsAvailable.toSignificant(1)
}
