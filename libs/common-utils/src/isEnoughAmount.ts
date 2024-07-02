import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  _targetAmount: CurrencyAmount<Currency> | BigNumber | undefined
): boolean | undefined {
  if (!_targetAmount) return undefined

  const targetAmount = _targetAmount instanceof BigNumber ? _targetAmount.toHexString() : _targetAmount

  return sellAmount.equalTo(targetAmount) || sellAmount.lessThan(targetAmount)
}
