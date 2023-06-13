import { Currency, Price } from '@uniswap/sdk-core'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

import { useExecutionPriceFiat } from './hooks/useExecutionPriceFiat'

export interface ExecutionPriceProps {
  executionPrice: Price<Currency, Currency>
  isInverted: boolean
  showBaseCurrency?: boolean
  separatorSymbol?: string
}

export function ExecutionPrice({
  executionPrice,
  isInverted,
  showBaseCurrency,
  separatorSymbol = '≈',
}: ExecutionPriceProps) {
  const executionPriceFiat = useExecutionPriceFiat(executionPrice, isInverted)
  const quoteCurrency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const baseCurrency = isInverted ? executionPrice?.quoteCurrency : executionPrice?.baseCurrency
  const oneBaseCurrency = tryParseCurrencyAmount('1', baseCurrency)

  return (
    <span>
      {showBaseCurrency && <TokenAmount amount={oneBaseCurrency} tokenSymbol={baseCurrency} />}
      {` ${separatorSymbol} `}
      <TokenAmount amount={isInverted ? executionPrice.invert() : executionPrice} tokenSymbol={quoteCurrency} />
      {executionPriceFiat && (
        <i>
          &nbsp;(
          <FiatAmount accurate={true} amount={executionPriceFiat} />)
        </i>
      )}
    </span>
  )
}
