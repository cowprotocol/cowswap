import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import { useExecutionPriceFiat } from './hooks/useExecutionPriceFiat'

export interface ExecutionPriceProps {
  executionPrice: Price<Currency, Currency>
  isInverted: boolean
  showBaseCurrency?: boolean
  hideSeparator?: boolean
  separatorSymbol?: string
  hideFiat?: boolean
  className?: string
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function ExecutionPrice({
  executionPrice,
  isInverted,
  showBaseCurrency,
  separatorSymbol = '≈',
  hideSeparator,
  hideFiat,
  className,
}: ExecutionPriceProps) {
  const executionPriceFiat = useExecutionPriceFiat(hideFiat ? null : executionPrice, isInverted)
  const quoteCurrency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const baseCurrency = isInverted ? executionPrice?.quoteCurrency : executionPrice?.baseCurrency
  const oneBaseCurrency = tryParseCurrencyAmount('1', baseCurrency)

  return (
    <span className={className}>
      {showBaseCurrency && <TokenAmount amount={oneBaseCurrency} tokenSymbol={baseCurrency} />}
      {!hideSeparator && ` ${separatorSymbol} `}
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
