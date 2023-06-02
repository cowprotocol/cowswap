import { Currency, Price } from '@uniswap/sdk-core'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

import { useExecutionPriceFiat } from './hooks/useExecutionPriceFiat'

export interface ExecutionPriceProps {
  executionPrice: Price<Currency, Currency>
  isInverted: boolean
}

export function ExecutionPrice({ executionPrice, isInverted }: ExecutionPriceProps) {
  const executionPriceFiat = useExecutionPriceFiat(executionPrice, isInverted)
  const quoteCurrency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency

  return (
    <span>
      ≈ <TokenAmount amount={isInverted ? executionPrice.invert() : executionPrice} tokenSymbol={quoteCurrency} />
      {executionPriceFiat && (
        <i>
          &nbsp;(
          <FiatAmount accurate={true} amount={executionPriceFiat} />)
        </i>
      )}
    </span>
  )
}
