import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { useExecutionPriceFiat } from '@cow/modules/limitOrders/hooks/useExecutionPriceFiat'
import { Currency, Price } from '@uniswap/sdk-core'

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
