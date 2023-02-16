import { useLayoutEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useUpdateAtom } from 'jotai/utils'

import { getQuote } from '@cow/api/gnosisProtocol'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useQuoteRequestParams } from '../useQuoteRequestParams'
import { useHandleResponse } from './useHandleResponse'
import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'
import { onlyResolvesLast } from 'utils/async'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import useIsWindowVisible from 'hooks/useIsWindowVisible'

// Every 10s
const REFETCH_CHECK_INTERVAL = 10000

const getQuoteOnlyResolveLast = onlyResolvesLast<SimpleGetQuoteResponse>(getQuote)

export function useFetchMarketPrice() {
  const { chainId, account } = useWeb3React()

  // TODO: should be throttled to avoid too frequent requests
  const feeQuoteParams = useQuoteRequestParams()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const { isWrapOrUnwrap } = useDetectNativeToken()

  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersTradeState()
  const handleResponse = useHandleResponse()

  const isWindowVisible = useIsWindowVisible()

  // Main hook updater
  useLayoutEffect(() => {
    if (!feeQuoteParams || isWrapOrUnwrap || !isWindowVisible) {
      console.debug('[useFetchMarketPrice] No need to fetch quotes')
      return
    }

    console.debug('[useFetchMarketPrice] Periodically fetch quotes')
    const handleFetchQuote = () => {
      console.debug('[useFetchMarketPrice] Fetching price')
      getQuoteOnlyResolveLast(feeQuoteParams)
        .then(handleResponse)
        .catch((error: GpQuoteError) => {
          setLimitOrdersQuote({ error })
          updateLimitRateState({ executionRate: null })
        })
        .finally(() => updateLimitRateState({ isLoadingExecutionRate: false }))
    }

    handleFetchQuote()

    // Run the interval
    const intervalId = setInterval(handleFetchQuote, REFETCH_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [feeQuoteParams, handleResponse, updateLimitRateState, setLimitOrdersQuote, isWrapOrUnwrap, isWindowVisible])

  // Turn on the loading if some of these dependencies have changed and remove execution rate
  useLayoutEffect(() => {
    updateLimitRateState({ isLoadingExecutionRate: true, executionRate: null })
  }, [chainId, inputCurrency, outputCurrency, orderKind, account, updateLimitRateState])

  return null
}
