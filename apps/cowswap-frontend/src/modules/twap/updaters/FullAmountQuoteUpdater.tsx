import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { CrossChainQuoteAndPost, isBridgeQuoteAndPost } from '@cowprotocol/sdk-bridging'

import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import {
  getCaptchaToken,
  isQuoteRateLimited,
  pauseQuotesOnRateLimit,
  quoteRateLimitedUntilAtom,
} from 'entities/captcha/state/quoteRateLimitedUntilAtom'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'
import { QUOTE_SETTINGS } from 'tradingSdk/tradingSdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeQuote, useQuoteParams } from 'modules/tradeQuote'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getQuoteOnlyResolveLast = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FullAmountQuoteUpdater() {
  const canQuote = useAtomValue(captchaCanQuoteAtom)
  const quoteRateLimitedUntil = useAtomValue(quoteRateLimitedUntilAtom)
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { quote, error, isLoading } = useTradeQuote()

  const fullQuoteAmount = inputCurrencyAmount?.quotient.toString() || null
  const partQuoteAmount = quote?.quoteResults.quoteResponse.quote.buyAmount

  const quoteParams = useQuoteParams(fullQuoteAmount)?.quoteParams
  const updateQuoteState = useSetAtom(fullAmountQuoteAtom)

  useEffect(() => {
    if (
      !canQuote ||
      isQuoteRateLimited(quoteRateLimitedUntil) ||
      error ||
      isLoading ||
      !partQuoteAmount ||
      !quoteParams
    ) {
      return
    }

    const captchaToken = getCaptchaToken()

    getQuoteOnlyResolveLast(quoteParams, QUOTE_SETTINGS)
      .then((response) => {
        const { cancelled, data } = response

        if (cancelled) {
          return
        }

        const quote = isBridgeQuoteAndPost(data) ? data.swap.quoteResponse : data.quoteResults.quoteResponse

        updateQuoteState(quote)
      })
      .catch((err: unknown) => {
        pauseQuotesOnRateLimit(err, captchaToken)
        console.error('[TWAP FullAmountQuoteUpdater]:: fetchQuote error', err)
      })
  }, [canQuote, quoteRateLimitedUntil, partQuoteAmount, isLoading, error, quoteParams, updateQuoteState])

  return null
}
