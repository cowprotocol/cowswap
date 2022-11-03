import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useHandleError } from './useHandleError'

export function useHandleResponse() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const handleError = useHandleError()

  return useCallback(
    (response: SimpleGetQuoteResponse) => {
      try {
        const { buyAmount, sellAmount } = response.quote

        if (!outputCurrency || !inputCurrency) {
          return
        }

        // Parse values
        const parsedBuyAmount = adjustDecimals(Number(buyAmount), inputCurrency.decimals)
        const parsedSellAmount = adjustDecimals(Number(sellAmount), outputCurrency.decimals)

        // Calculate execution rate
        const amount = isInversed ? parsedSellAmount.div(parsedBuyAmount) : parsedBuyAmount.div(parsedSellAmount)

        // Parse for decimals
        const executionRate = amount.toFixed(20)

        // Update the rate state
        updateLimitRateState({ executionRate })

        // Update limit order quote
        setLimitOrdersQuote(response)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError, inputCurrency, isInversed, outputCurrency, setLimitOrdersQuote, updateLimitRateState]
  )
}
