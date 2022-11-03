import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useUpdateAtom } from 'jotai/utils'

import { getQuote } from '@cow/api/gnosisProtocol'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useQuoteRequestParams } from './useQuoteRequestParams'
import { useHandleResponse } from './useHandleResponse'
import { useHandleError } from './useHandleError'

// Every 10s
const REFETCH_CHECK_INTERVAL = 10000

export function useFetchMarketPrice() {
  const { chainId, account } = useWeb3React()

  const feeQuoteParams = useQuoteRequestParams()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)

  const handleResponse = useHandleResponse()
  const handleError = useHandleError()

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
