import { useEffect, useMemo, useState } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@cowprotocol/currency'

import ms from 'ms.macro'
import { Nullish } from 'types'

import { useDerivedTradeState } from 'modules/trade'
import { isQuoteForCurrencies, TradeQuoteState, useTradeQuote } from 'modules/tradeQuote'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { logPriceImpact } from './logger'

const TRADE_SET_UP_DEBOUNCE_TIME = ms`100ms`
const PRICE_IMPACT_LOADING_TIMEOUT = ms`15s`

interface FiatValuePriceImpact {
  priceImpact: Percent | undefined
  isLoading: boolean
}

interface LoadingTimeout {
  inputToken: Token
  outputToken: Token
  quoteFetchStartTimestamp: number | undefined
}

interface SettledPriceImpact {
  inputToken: Token
  outputToken: Token
  priceImpact: Percent | undefined
}

export function useFiatValuePriceImpact(): FiatValuePriceImpact | null {
  const state = useDerivedTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = state || {}

  const inputToken = useMemo(() => (inputCurrency ? getWrappedToken(inputCurrency) : undefined), [inputCurrency])
  const outputToken = useMemo(() => (outputCurrency ? getWrappedToken(outputCurrency) : undefined), [outputCurrency])

  const isTradeSetUp = useDebounce(!!inputToken && !!outputToken, TRADE_SET_UP_DEBOUNCE_TIME)

  const {
    inputAmount: { value: fiatValueInput, isLoading: inputIsLoading },
    outputAmount: { value: fiatValueOutput, isLoading: outputIsLoading },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, inputToken, outputToken)

  const tradeQuote = useTradeQuote()
  const { isLoading: isQuoteLoading, hasParamsChanged: quoteParamsChanged, fetchParams } = tradeQuote

  // Bumps on every genuine quote request (see `doQuotePolling`). Used to re-arm the timeout below.
  const quoteFetchStartTimestamp = fetchParams?.fetchStartTimestamp

  // Trade-quote signals indicate the current output amount is stale (token just changed
  // or a fresh quote is in flight). Compute price impact only once the quote catches up,
  // otherwise we'd display a huge nonsense % derived from mismatched in/out amounts.
  const isQuoteBehind = isQuoteBehindTrade(tradeQuote, inputCurrencyAmount, outputCurrencyAmount)
  const isLoading = inputIsLoading || outputIsLoading || isQuoteLoading || quoteParamsChanged || isQuoteBehind
  const hasLoadingTimedOut = useHasLoadingTimedOut(isTradeSetUp, inputToken, outputToken, quoteFetchStartTimestamp)

  const current = useSafeMemo((): FiatValuePriceImpact | null => {
    // Don't calculate price impact if trade is not set up (both trade assets are not set)
    if (!isTradeSetUp) return null

    const stillLoading = isLoading && !hasLoadingTimedOut

    // While a fresh quote is loading, don't expose the stale value at all — consumers
    // hide the percentage when `priceImpact` is undefined, leaving just the spinner.
    if (stillLoading) {
      return { priceImpact: undefined, isLoading: true }
    }

    const priceImpact = computeFiatValuePriceImpact(
      fiatValueInput ? FractionUtils.fractionLikeToFraction(fiatValueInput) : null,
      fiatValueOutput ? FractionUtils.fractionLikeToFraction(fiatValueOutput) : null,
    )

    return { priceImpact, isLoading: false }
  }, [isTradeSetUp, fiatValueInput, fiatValueOutput, isLoading, hasLoadingTimedOut])

  return useSettledDuringRequote(current, inputToken, outputToken)
}

function computeFiatValuePriceImpact(
  fiatValueInput: Fraction | null,
  fiatValueOutput: Fraction | null,
): Percent | undefined {
  if (!fiatValueOutput || !fiatValueInput) return undefined
  const fiatValueInputNum = +fiatValueInput.toFixed(6)
  if (!fiatValueInputNum || fiatValueInputNum <= 0) return undefined

  const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput))

  return new Percent(pct.numerator, pct.denominator)
}

// The quote request starts only after a debounce, so right after a token switch nothing is loading yet
// while the form still holds the previous pair's amount: the quote's own pair covers that gap.
function isQuoteBehindTrade(
  tradeQuote: TradeQuoteState,
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
): boolean {
  if (!inputCurrencyAmount || !outputCurrencyAmount || tradeQuote.error) return false

  return !isQuoteForCurrencies(tradeQuote, inputCurrencyAmount.currency, outputCurrencyAmount.currency)
}

function isSettledForPair(
  settled: SettledPriceImpact | null,
  inputToken: Token | undefined,
  outputToken: Token | undefined,
): settled is SettledPriceImpact {
  return (
    !!settled &&
    !!inputToken &&
    !!outputToken &&
    settled.inputToken.equals(inputToken) &&
    settled.outputToken.equals(outputToken)
  )
}

// Restart the safety-valve timeout on a token-pair change OR whenever a new quote request begins
// (`quoteFetchStartTimestamp`, which bumps per fetch). Keying it off the `quoteParamsChanged`
// boolean instead left the timeout stuck once it had fired: a second changed-params quote for the
// same pair keeps the flag `true`, so the effect never re-ran and the stale value rendered immediately.
// The per-fetch timestamp re-arms on every genuinely new quote, while plain loading flicker (no new
// fetch) still lets a stuck quote time out.
// The fired timeout is matched against the current pair/fetch during render: a flag reset in an effect
// would still read `true` for one render after a pair change and leak a stale "settled" state into it.
function useHasLoadingTimedOut(
  isTradeSetUp: boolean,
  inputToken: Token | undefined,
  outputToken: Token | undefined,
  quoteFetchStartTimestamp: number | undefined,
): boolean {
  const [timedOut, setTimedOut] = useState<LoadingTimeout | null>(null)

  useEffect(() => {
    logPriceImpact.debug(`Price impact timeout reset`)
    setTimedOut(null)
    if (!isTradeSetUp || !inputToken || !outputToken) return

    const timeoutId = setTimeout(() => {
      setTimedOut({ inputToken, outputToken, quoteFetchStartTimestamp })
      logPriceImpact.warn(`Price impact loading timed out after ${PRICE_IMPACT_LOADING_TIMEOUT / 1000}s`)
    }, PRICE_IMPACT_LOADING_TIMEOUT)

    return () => clearTimeout(timeoutId)
  }, [isTradeSetUp, inputToken, outputToken, quoteFetchStartTimestamp])

  return (
    !!timedOut &&
    !!inputToken &&
    !!outputToken &&
    timedOut.inputToken.equals(inputToken) &&
    timedOut.outputToken.equals(outputToken) &&
    timedOut.quoteFetchStartTimestamp === quoteFetchStartTimestamp
  )
}

// A requote keeps the pair's last settled state (known or unknown) instead of flipping to loading,
// otherwise consumers keyed on `isLoading || !priceImpact` (NoImpactWarning) flicker on every requote.
function useSettledDuringRequote(
  current: FiatValuePriceImpact | null,
  inputToken: Token | undefined,
  outputToken: Token | undefined,
): FiatValuePriceImpact | null {
  const [lastSettled, setLastSettled] = useState<SettledPriceImpact | null>(null)

  useEffect(() => {
    if (inputToken && outputToken && current && !current.isLoading) {
      setLastSettled({ inputToken, outputToken, priceImpact: current.priceImpact })
      return
    }

    setLastSettled((prev) => (isSettledForPair(prev, inputToken, outputToken) ? prev : null))
  }, [current, inputToken, outputToken])

  const settled = isSettledForPair(lastSettled, inputToken, outputToken) ? lastSettled : null

  return useSafeMemo(() => {
    if (current?.isLoading && settled) {
      return { priceImpact: settled.priceImpact, isLoading: false }
    }

    return current
  }, [current, settled])
}
