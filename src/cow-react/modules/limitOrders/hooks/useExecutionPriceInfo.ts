import { useMemo } from 'react'
import { calculateExecutionPrice, ExecutionPriceParams } from '@cow/modules/limitOrders/utils/calculateExecutionPrice'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { rawToTokenAmount } from '@cow/utils/rawToTokenAmount'

export interface ExecutionPriceInfo {
  price: Price<Currency, Currency> | null
  fiatPrice: CurrencyAmount<Currency> | null
  feeAmount: CurrencyAmount<Currency> | null
}

export function useExecutionPriceInfo(params: ExecutionPriceParams, isInversed: boolean): ExecutionPriceInfo {
  const { marketRate, feeAmount, inputCurrencyAmount, outputCurrencyAmount } = params

  const executionPrice = useMemo(() => {
    const price = calculateExecutionPrice({
      inputCurrencyAmount,
      outputCurrencyAmount,
      feeAmount,
      marketRate,
    })

    if (!price) return null

    return isInversed ? price.invert() : price
  }, [feeAmount, marketRate, inputCurrencyAmount, outputCurrencyAmount, isInversed])

  const fiatPrice = useHigherUSDValue(
    executionPrice
      ? executionPrice.quote(
          CurrencyAmount.fromRawAmount(
            executionPrice.baseCurrency,
            rawToTokenAmount(1, executionPrice.baseCurrency.decimals)
          )
        )
      : undefined
  )

  return { price: executionPrice, fiatPrice, feeAmount }
}
