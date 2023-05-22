import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { LimitRateState, updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { limitOrdersQuoteAtom } from 'modules/limitOrders/state/limitOrdersQuoteAtom'
import { CancelableResult } from 'legacy/utils/async'
import { FractionUtils } from 'utils/fractionUtils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export const LIMIT_ORDERS_PRICE_SLIPPAGE = new Percent(1, 10) // 0.1%

export function handleLimitOrderQuoteResponse(
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
  response: CancelableResult<OrderQuoteResponse>
): { rateState: Partial<LimitRateState>; quote: OrderQuoteResponse } | undefined {
  const { cancelled, data } = response

  if (cancelled) {
    return
  }

  const { buyAmount: buyAmountRaw, sellAmount: sellAmountRaw, feeAmount: feeAmountRaw } = data.quote

  if (!outputCurrency || !inputCurrency) {
    return
  }

  const feeAmount = CurrencyAmount.fromRawAmount(inputCurrency, feeAmountRaw)
  const sellAmount = CurrencyAmount.fromRawAmount(inputCurrency, sellAmountRaw)
  const buyAmount = CurrencyAmount.fromRawAmount(outputCurrency, buyAmountRaw)

  const price = FractionUtils.fractionLikeToFraction(new Price({ baseAmount: sellAmount, quoteAmount: buyAmount }))
  const marketRateWithSlippage = price.subtract(price.multiply(LIMIT_ORDERS_PRICE_SLIPPAGE.divide(100)))

  return {
    rateState: { marketRate: marketRateWithSlippage, feeAmount },
    quote: data,
  }
}

export function useHandleResponse() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)

  return useCallback(
    (response: CancelableResult<OrderQuoteResponse>) => {
      try {
        const result = handleLimitOrderQuoteResponse(inputCurrency, outputCurrency, response)

        if (!result) return

        const { rateState, quote } = result

        updateLimitRateState(rateState)
        setLimitOrdersQuote({ response: quote })
      } catch (error: any) {
        console.debug('[useFetchMarketPrice] Failed to fetch exection price', error)
        updateLimitRateState({ marketRate: null })
      }
    },
    [inputCurrency, outputCurrency, setLimitOrdersQuote, updateLimitRateState]
  )
}
