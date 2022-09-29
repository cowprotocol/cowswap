import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from 'cow-react/modules/limitOrders/state/limitOrdersQuoteAtom'
import { getQuote } from 'api/gnosisProtocol'
import { useEffect } from 'react'
import { useQuoteRequestParams } from 'cow-react/modules/limitOrders/containers/QuoteResolver/hooks/useQuoteRequestParams'

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
