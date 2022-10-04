import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useEffect } from 'react'
import { useQuoteRequestParams } from '@cow/modules/limitOrders/containers/QuoteResolver/hooks/useQuoteRequestParams'
import { getQuote } from '@cow/api/gnosisProtocol'

export const QuoteResolver = () => {
  const setLimitOrdersQuote = useSetAtom(limitOrdersQuoteAtom)
  const feeQuoteParams = useQuoteRequestParams()

  useEffect(() => {
    if (feeQuoteParams) {
      console.debug('LIMIT ORDER QUOTE REQUEST:', feeQuoteParams)

      getQuote(feeQuoteParams)
        .then(setLimitOrdersQuote)
        .catch((e) => {
          // TODO: process error
          console.error('Limit order quote error: ', e)
        })
    }
  }, [setLimitOrdersQuote, feeQuoteParams])

  return null
}
