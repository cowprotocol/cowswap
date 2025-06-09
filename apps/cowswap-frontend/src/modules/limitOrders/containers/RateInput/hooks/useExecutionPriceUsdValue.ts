import { useAtomValue } from 'jotai'

import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency, Price } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { limitRateAtom } from '../../../state/limitRateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useExecutionPriceUsdValue(executionPrice: Price<Currency, Currency> | null) {
  const { isInverted } = useAtomValue(limitRateAtom)
  const executionPriceToDisplay = isInverted ? executionPrice?.invert() : executionPrice
  const executionPriceBaseAmount = tryParseCurrencyAmount(
    '1',
    isInverted ? executionPrice?.quoteCurrency : executionPrice?.baseCurrency,
  )

  const { value: rateAsUsdAmount } = useUsdAmount(
    executionPriceBaseAmount ? executionPriceToDisplay?.quote(executionPriceBaseAmount) : null,
  )

  return rateAsUsdAmount
}
