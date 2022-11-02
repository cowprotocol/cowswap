import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useUpdateAtom } from 'jotai/utils'

import { getQuote } from '@cow/api/gnosisProtocol'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useQuoteRequestParams } from './useQuoteRequestParams'

// Every 10s
const REFETCH_CHECK_INTERVAL = 10000

export function useGetMarketPrice() {
  const { chainId, account } = useWeb3React()

  const feeQuoteParams = useQuoteRequestParams()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)

  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)

  // Handle error
  const handleError = useCallback(
    (error) => {
      updateLimitRateState({ executionRate: null })
      console.debug('[useFetchMarketPrice] Failed to fetch exection price', error)
    },
    [updateLimitRateState]
  )

  // Handle response
  const handleResponse = useCallback(
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

  // Main hook updater
  useEffect(() => {
    console.debug('LIMIT ORDER QUOTE REQUEST:', feeQuoteParams)

    const handleFetchQuote = () => {
      if (!feeQuoteParams) {
        return
      }

      getQuote(feeQuoteParams)
        .then(handleResponse)
        .catch(handleError)
        .finally(() => {
          updateLimitRateState({ isLoadingExecutionRate: false })
        })
    }

    handleFetchQuote()

    // Run the interval
    const intervalId = setInterval(handleFetchQuote, REFETCH_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [feeQuoteParams, handleResponse, handleError, updateLimitRateState])

  // Turn on the loading if some of these dependencies have changed
  useEffect(() => {
    updateLimitRateState({ isLoadingExecutionRate: true })
  }, [chainId, inputCurrency, outputCurrency, orderKind, account, isInversed, updateLimitRateState])

  return null
}
