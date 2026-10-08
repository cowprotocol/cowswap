import { useEffect, useMemo, useState } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction, Percent, Token } from '@cowprotocol/currency'

import ms from 'ms.macro'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { logPriceImpact } from './logger'

const TRADE_SET_UP_DEBOUNCE_TIME = ms`100ms`
const PRICE_IMPACT_LOADING_TIMEOUT = ms`15s`

interface FiatValuePriceImpact {
  priceImpact: Percent | undefined
  isLoading: boolean
}

interface SettledPriceImpact {
  inputToken: Token
  outputToken: Token
  priceImpact: Percent
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

  const { isLoading: isQuoteLoading, hasParamsChanged: quoteParamsChanged, fetchParams } = useTradeQuote()

  // Bumps on every genuine quote request (see `doQuotePolling`). Used to re-arm the timeout below.
  const quoteFetchStartTimestamp = fetchParams?.fetchStartTimestamp

  // Trade-quote signals indicate the current output amount is stale (token just changed
  // or a fresh quote is in flight). Compute price impact only once the quote catches up,
  // otherwise we'd display a huge nonsense % derived from mismatched in/out amounts.
  const isLoading = inputIsLoading || outputIsLoading || isQuoteLoading || quoteParamsChanged
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false)

  // Restart the safety-valve timeout on a token-pair change OR whenever a new quote request begins
  // (`quoteFetchStartTimestamp`, which bumps per fetch). Keying it off the `quoteParamsChanged`
  // boolean instead left `hasLoadingTimedOut` stuck true once it had timed out: a second changed-
  // params quote for the same pair keeps the flag `true`, so the effect never re-ran and the stale
  // value rendered immediately. The per-fetch timestamp re-arms on every genuinely new quote, while
  // plain loading flicker (no new fetch) still lets a stuck quote time out.
  useEffect(() => {
    logPriceImpact.debug(`Price impact timeout reset`)
    setHasLoadingTimedOut(false)
    if (!isTradeSetUp) return

    const timeoutId = setTimeout(() => {
      setHasLoadingTimedOut(true)
      logPriceImpact.warn(`Price impact loading timed out after ${PRICE_IMPACT_LOADING_TIMEOUT / 1000}s`)
    }, PRICE_IMPACT_LOADING_TIMEOUT)

    return () => clearTimeout(timeoutId)
  }, [isTradeSetUp, inputToken, outputToken, quoteFetchStartTimestamp])

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

// A requote after an amount change keeps the pair's last settled value instead of flipping to loading,
// otherwise consumers keyed on `isLoading || !priceImpact` (NoImpactWarning) flicker on every keystroke.
function useSettledDuringRequote(
  current: FiatValuePriceImpact | null,
  inputToken: Token | undefined,
  outputToken: Token | undefined,
): FiatValuePriceImpact | null {
  const [lastSettled, setLastSettled] = useState<SettledPriceImpact | null>(null)

  useEffect(() => {
    if (!current || current.isLoading || !current.priceImpact || !inputToken || !outputToken) return

    setLastSettled({ inputToken, outputToken, priceImpact: current.priceImpact })
  }, [current, inputToken, outputToken])

  const isSamePairAsSettled =
    !!lastSettled &&
    !!inputToken &&
    !!outputToken &&
    lastSettled.inputToken.equals(inputToken) &&
    lastSettled.outputToken.equals(outputToken)
  const settledPriceImpact = isSamePairAsSettled ? lastSettled.priceImpact : undefined

  return useSafeMemo(() => {
    if (current?.isLoading && settledPriceImpact) {
      return { priceImpact: settledPriceImpact, isLoading: false }
    }

    return current
  }, [current, settledPriceImpact])
}
