import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  _targetAmount: CurrencyAmount<Currency> | bigint | undefined,
): boolean | undefined {
  if (typeof _targetAmount === 'undefined' || _targetAmount === null) return undefined

  const targetAmount = typeof _targetAmount === 'bigint' ? _targetAmount.toString() : _targetAmount

  return sellAmount.equalTo(targetAmount) || sellAmount.lessThan(targetAmount)
}
