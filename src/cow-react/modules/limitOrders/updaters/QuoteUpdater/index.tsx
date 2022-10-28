import { useSetAtom } from 'jotai'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useEffect } from 'react'
import { useQuoteRequestParams } from './hooks/useQuoteRequestParams'
import { getQuote } from '@cow/api/gnosisProtocol'

export function QuoteUpdater() {
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
