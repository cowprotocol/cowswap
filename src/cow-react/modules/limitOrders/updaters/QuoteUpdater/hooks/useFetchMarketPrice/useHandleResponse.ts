import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'

import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { CancelableResult } from 'utils/async'
import { FractionUtils } from '@cow/utils/fractionUtils'

export function useHandleResponse() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)

  return useCallback(
    (response: CancelableResult<SimpleGetQuoteResponse>) => {
      const { cancelled, data } = response

      try {
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

        const marketRate = FractionUtils.fractionLikeToFraction(
          new Price({ baseAmount: sellAmount, quoteAmount: buyAmount })
        )

        updateLimitRateState({ marketRate, feeAmount })
        setLimitOrdersQuote({ response: data })
      } catch (error: any) {
        console.debug('[useFetchMarketPrice] Failed to fetch exection price', error)
        updateLimitRateState({ marketRate: null })
      }
    },
    [inputCurrency, outputCurrency, setLimitOrdersQuote, updateLimitRateState]
  )
}
