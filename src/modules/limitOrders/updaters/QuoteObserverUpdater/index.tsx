import { useEffect } from 'react'
import { useTradeQuote } from 'modules/tradeQuote'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { FractionUtils } from 'utils/fractionUtils'
import { updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useUpdateAtom } from 'jotai/utils'

export const LIMIT_ORDERS_PRICE_SLIPPAGE = new Percent(1, 10) // 0.1%

export function QuoteObserverUpdater() {
  const { response } = useTradeQuote()
  const { state } = useDerivedTradeState()

  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  useEffect(() => {
    if (!outputCurrency || !inputCurrency || !response) {
      return
    }

    const { buyAmount: buyAmountRaw, sellAmount: sellAmountRaw, feeAmount: feeAmountRaw } = response.quote

    const feeAmount = CurrencyAmount.fromRawAmount(inputCurrency, feeAmountRaw)
    const sellAmount = CurrencyAmount.fromRawAmount(inputCurrency, sellAmountRaw)
    const buyAmount = CurrencyAmount.fromRawAmount(outputCurrency, buyAmountRaw)

    if (sellAmount.equalTo(0) || buyAmount.equalTo(0)) return

    const price = FractionUtils.fractionLikeToFraction(new Price({ baseAmount: sellAmount, quoteAmount: buyAmount }))
    const marketRate = price.subtract(price.multiply(LIMIT_ORDERS_PRICE_SLIPPAGE.divide(100)))

    updateLimitRateState({ marketRate, feeAmount })
  }, [response, inputCurrency, outputCurrency, updateLimitRateState])

  return null
}
