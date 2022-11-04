import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { Fraction } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useHandleError } from './useHandleError'
import { getDecimals } from '@cow/modules/limitOrders/utils/getDecimals'

export function useHandleResponse() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const handleError = useHandleError()

  return useCallback(
    (response: SimpleGetQuoteResponse) => {
      try {
        const { buyAmount, sellAmount } = response.quote

        if (!outputCurrency || !inputCurrency) {
          return
        }

        // Adjust for decimals
        const adjustedBuy = JSBI.multiply(JSBI.BigInt(buyAmount), JSBI.BigInt(10 ** getDecimals(inputCurrency)))
        const adjustedSell = JSBI.multiply(JSBI.BigInt(sellAmount), JSBI.BigInt(10 ** getDecimals(outputCurrency)))

        // Create executionRate fraction
        const executionRate = new Fraction(adjustedBuy, adjustedSell)

        // Update the rate state
        updateLimitRateState({ executionRate })

        // Update limit order quote
        setLimitOrdersQuote(response)
      } catch (error) {
        handleError(error)
      }
    },
    [handleError, inputCurrency, outputCurrency, setLimitOrdersQuote, updateLimitRateState]
  )
}
