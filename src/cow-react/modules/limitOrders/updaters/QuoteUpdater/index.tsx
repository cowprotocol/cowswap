import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useEffect } from 'react'
import { useQuoteRequestParams } from './hooks/useQuoteRequestParams'
import { getQuote } from '@cow/api/gnosisProtocol'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'

export function QuoteUpdater() {
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const feeQuoteParams = useQuoteRequestParams()

  useEffect(() => {
    if (feeQuoteParams) {
      console.debug('LIMIT ORDER QUOTE REQUEST:', feeQuoteParams)

      getQuote(feeQuoteParams)
        .then((response) => {
          setLimitOrdersQuote({ response, error: undefined })
        })
        .catch((error: GpQuoteError) => {
          setLimitOrdersQuote({ response: undefined, error })
        })
    }
  }, [setLimitOrdersQuote, feeQuoteParams])

  return null
}
