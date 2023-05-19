import { useLayoutEffect } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { getQuote } from 'api/gnosisProtocol'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useQuoteRequestParams } from '../useQuoteRequestParams'
import { useHandleResponse } from './useHandleResponse'
import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from 'modules/limitOrders/state/limitOrdersQuoteAtom'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'
import { onlyResolvesLast } from 'legacy/utils/async'
import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'
import { useWalletInfo } from 'modules/wallet'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useFetchMarketPrice() {
  const { chainId, account } = useWalletInfo()

  // TODO: should be throttled to avoid too frequent requests
  const feeQuoteParams = useQuoteRequestParams()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersDerivedState()
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
          updateLimitRateState({ marketRate: null })
        })
        .finally(() => updateLimitRateState({ isLoadingMarketRate: false }))
    }

    handleFetchQuote()

    // Run the interval
    const intervalId = setInterval(handleFetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [feeQuoteParams, handleResponse, updateLimitRateState, setLimitOrdersQuote, isWrapOrUnwrap, isWindowVisible])

  // Turn on the loading if some of these dependencies have changed and remove execution rate
  useLayoutEffect(() => {
    updateLimitRateState({ isLoadingMarketRate: true, marketRate: null })
  }, [chainId, inputCurrency, outputCurrency, orderKind, account, updateLimitRateState])

  return null
}
