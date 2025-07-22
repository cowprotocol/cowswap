import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function isEnoughAmount(
  sellAmount: CurrencyAmount<Currency>,
  _targetAmount: CurrencyAmount<Currency> | BigNumber | bigint | undefined,
): boolean | undefined {
  if (typeof _targetAmount === 'undefined' || _targetAmount === null) return undefined

  const targetAmount =
    _targetAmount instanceof BigNumber
      ? _targetAmount.toHexString()
      : typeof _targetAmount === 'bigint'
        ? _targetAmount.toString()
        : _targetAmount

  return sellAmount.equalTo(targetAmount) || sellAmount.lessThan(targetAmount)
}
