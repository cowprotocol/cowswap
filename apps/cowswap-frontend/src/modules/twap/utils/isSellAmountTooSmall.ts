import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { MINIMUM_PART_SELL_AMOUNT_FIAT } from '../const'

export function isSellAmountTooSmall(
  sellAmount: Nullish<CurrencyAmount<Currency>>,
  chainId: SupportedChainId | undefined,
): boolean {
  if (!chainId) {
    return false
  }

  const minimum = MINIMUM_PART_SELL_AMOUNT_FIAT[chainId]

  return !!minimum && !!sellAmount && sellAmount.lessThan(minimum)
}
