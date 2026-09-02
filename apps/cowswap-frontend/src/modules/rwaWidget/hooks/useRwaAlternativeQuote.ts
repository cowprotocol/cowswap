import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind, QuoteAndPost } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { isQuoteAndPost, QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { Field } from 'legacy/state/types'

import { useRwaAlternativeToken } from 'modules/rwa'
import { swapDerivedStateAtom } from 'modules/swap'
import { QUOTE_POLLING_INTERVAL, useQuoteParams, useTradeQuote } from 'modules/tradeQuote'

export interface RwaAlternativeQuoteInfo {
  field: Field.INPUT | Field.OUTPUT
  alternativeCurrency: TokenWithLogo
  alternativeAmount: CurrencyAmount<Currency>
  isBetter: boolean
  isLoading: boolean
}

interface RwaAlternativeTarget {
  field: Field.INPUT | Field.OUTPUT
  alternative: TokenWithLogo
}

/**
 * Fetches a quote for the RWA counterpart (Ondo <-> xStocks) of whichever side of the current trade holds an RWA
 * token, and compares it against the main quote.
 *
 * This is a standalone fetch with its own poll timer (no global state) — it's a supplementary display, not part of
 * the primary trade flow.
 */
export function useRwaAlternativeQuote(): RwaAlternativeQuoteInfo | undefined {
  const { inputCurrency, outputCurrency, orderKind, inputCurrencyAmount, outputCurrencyAmount } =
    useAtomValue(swapDerivedStateAtom)
  const independentAmount = isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount

  const inputAlternative = useRwaAlternativeToken(inputCurrency)
  const outputAlternative = useRwaAlternativeToken(outputCurrency)

  const target = useMemo(() => {
    if (inputAlternative && !outputAlternative) return { field: Field.INPUT, alternative: inputAlternative } as const
    if (outputAlternative && !inputAlternative) return { field: Field.OUTPUT, alternative: outputAlternative } as const
    return undefined
  }, [inputAlternative, outputAlternative])

  const { quoteParams, appData } = useQuoteParams(independentAmount?.quotient.toString()) || {}

  const mainQuote = useTradeQuote()

  const altQuoteParams: QuoteBridgeRequest | undefined = useMemo(() => {
    if (!quoteParams || !target) return undefined
    // Bridging isn't supported for the alternative-quote comparison, only same-chain swaps
    if (quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId) return undefined
    // The comparison is meaningless without a main quote to compare against, and hydration (wallet connecting,
    // app data loading) tends to move the main quote's own params through a few transient states — waiting for it
    // to land avoids racing that same churn with a second, redundant stream of requests.
    if (!mainQuote.quote) return undefined

    const { alternative, field } = target

    return field === Field.INPUT
      ? { ...quoteParams, sellTokenAddress: alternative.address, sellTokenDecimals: alternative.decimals }
      : { ...quoteParams, buyTokenAddress: alternative.address, buyTokenDecimals: alternative.decimals }
  }, [quoteParams, target, mainQuote.quote])

  const [altQuote, setAltQuote] = useState<QuoteAndPost | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const requestIdRef = useRef(0)

  // Refetch on a fixed cadence matching the main quote's poll interval, so the comparison doesn't go stale while
  // the main quote keeps updating with market price. This is deliberately its own timer rather than reacting to
  // the main quote's internal state (e.g. localQuoteTimestamp), which toggles on every fetch attempt, not just
  // completed ones, and would refetch far more often than intended.
  const [pollTick, setPollTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setPollTick((tick) => tick + 1), QUOTE_POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!altQuoteParams) {
      setAltQuote(null)
      setIsLoading(false)
      return
    }

    const requestId = ++requestIdRef.current
    setIsLoading(true)

    bridgingSdk
      .getQuote(altQuoteParams, { appData, allowIntermediateEqSellToken: true })
      .then((quote) => {
        if (requestIdRef.current !== requestId) return
        // The comparison request is always same-chain (bridge trades are filtered out above), so this is always a plain swap quote
        setAltQuote(isQuoteAndPost(quote) ? quote : null)
        setIsLoading(false)
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return
        setAltQuote(null)
        setIsLoading(false)
      })
  }, [altQuoteParams, appData, pollTick])

  return useMemo(() => {
    if (!target || !inputCurrency || !outputCurrency) return undefined

    return buildRwaAlternativeQuoteInfo(
      target,
      orderKind,
      inputCurrency,
      outputCurrency,
      mainQuote.quote,
      altQuote,
      isLoading,
    )
  }, [target, inputCurrency, outputCurrency, orderKind, mainQuote.quote, altQuote, isLoading])
}

function buildRwaAlternativeQuoteInfo(
  target: RwaAlternativeTarget,
  orderKind: OrderKind,
  inputCurrency: Currency,
  outputCurrency: Currency,
  mainQuote: QuoteAndPost | null,
  altQuote: QuoteAndPost | null,
  isLoading: boolean,
): RwaAlternativeQuoteInfo | undefined {
  const mainAmounts = mainQuote?.quoteResults.amountsAndCosts.afterNetworkCosts
  const altAmounts = altQuote?.quoteResults.amountsAndCosts.afterNetworkCosts
  if (!mainAmounts || !altAmounts) return undefined

  const { isSell, mainCurrency, alternativeCurrency } = getRwaDependentCurrencies(
    target,
    orderKind,
    inputCurrency,
    outputCurrency,
  )

  const mainAmount = CurrencyAmount.fromRawAmount(mainCurrency, isSell ? mainAmounts.buyAmount : mainAmounts.sellAmount)
  const alternativeAmount = CurrencyAmount.fromRawAmount(
    alternativeCurrency,
    isSell ? altAmounts.buyAmount : altAmounts.sellAmount,
  )

  return {
    field: target.field,
    alternativeCurrency: target.alternative,
    alternativeAmount,
    isBetter: isSell ? alternativeAmount.greaterThan(mainAmount) : alternativeAmount.lessThan(mainAmount),
    isLoading,
  }
}

/**
 * The dependent (computed) side of the trade is what's being compared: the received amount for sell orders, the
 * paid amount for buy orders. That side's currency is the alternative RWA token when the RWA field is also the
 * dependent one, otherwise it's the unchanged counter-currency (e.g. both quotes pay/receive the same USDC).
 */
function getRwaDependentCurrencies(
  target: RwaAlternativeTarget,
  orderKind: OrderKind,
  inputCurrency: Currency,
  outputCurrency: Currency,
): { isSell: boolean; mainCurrency: Currency; alternativeCurrency: Currency } {
  const isSell = isSellOrder(orderKind)
  const dependentField = isSell ? Field.OUTPUT : Field.INPUT
  const mainCurrency = isSell ? outputCurrency : inputCurrency
  const alternativeCurrency = dependentField === target.field ? target.alternative : mainCurrency

  return { isSell, mainCurrency, alternativeCurrency }
}
