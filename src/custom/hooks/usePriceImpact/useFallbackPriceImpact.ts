import { useEffect, useMemo, useState } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { useSwapState } from 'state/swap/hooks'

import useExactInSwap, { useCalculateQuote } from './useQuoteAndSwap'
import { FallbackPriceImpactParams } from './types'
import { calculateFallbackPriceImpact, FeeQuoteParams } from 'utils/price'
import TradeGp from 'state/swap/TradeGp'
import { QuoteInformationObject } from 'state/price/reducer'
import { QuoteError } from 'state/price/actions'
import { useQuote } from 'state/price/hooks'
import { useActiveWeb3React } from 'hooks/web3'

type SwapParams = { abTrade?: TradeGp; sellToken?: string | null; buyToken?: string | null }

function _isQuoteValid(quote: QuoteInformationObject | FeeQuoteParams | undefined): quote is QuoteInformationObject {
  return Boolean(quote && 'lastCheck' in quote)
}

function _getBaTradeParams({ abTrade, sellToken, buyToken }: SwapParams) {
  if (!abTrade) return undefined

  const { inputAmount, outputAmount } = abTrade

  return {
    // We need to inverse the AB Trade parameters
    // Sell the AB Trade output amount for input tokens
    outputCurrency: inputAmount.currency,
    sellToken: buyToken,
    buyToken: sellToken,
    fromDecimals: outputAmount.currency.decimals,
    toDecimals: inputAmount.currency.decimals,
  }
}

function _getBaTradeParsedAmount(abTrade: TradeGp | undefined, shouldCalculate: boolean) {
  if (!shouldCalculate) return undefined

  // return the AB Trade's output amount WITHOUT fee
  return abTrade?.outputAmountWithoutFee
}

export default function useFallbackPriceImpact({ abTrade, isWrapping }: FallbackPriceImpactParams) {
  const {
    typedValue,
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
  } = useSwapState()

  const { chainId } = useActiveWeb3React()
  const lastQuote = useQuote({ token: sellToken, chainId })

  const [loading, setLoading] = useState(false)

  // Should we even calc this? Check if fiatPriceImpact exists OR user is wrapping token
  const shouldCalculate = !!abTrade && !isWrapping

  // to bail out early
  useEffect(() => {
    if (!shouldCalculate) {
      setLoading(false)
    }
  }, [shouldCalculate])

  // Calculate the necessary params to get the inverse trade impact
  const { parsedAmount, outputCurrency, ...swapQuoteParams } = useMemo(
    () => ({
      ..._getBaTradeParams({ abTrade, sellToken, buyToken }),
      parsedAmount: _getBaTradeParsedAmount(abTrade, shouldCalculate),
      validTo: lastQuote?.validTo,
    }),
    [abTrade, buyToken, lastQuote?.validTo, sellToken, shouldCalculate]
  )

  const { quote } = useCalculateQuote({
    ...swapQuoteParams,
    amountAtoms: parsedAmount?.quotient.toString(),
    loading,
    setLoading,
  })

  // Calculate BA trade
  // using the output values from the original A > B trade
  const baTrade = useExactInSwap({
    // if fiat impact exists, return undefined and dont compute swap
    // the amount traded now is the A > B output amount without fees
    quote: _isQuoteValid(quote) ? quote : undefined,
    parsedAmount,
    outputCurrency,
  })

  const [impact, setImpact] = useState<Percent | undefined>()
  const [error, setError] = useState<QuoteError | undefined>()

  // primitive values to use as dependencies
  const abIn = abTrade?.inputAmountWithoutFee.quotient.toString()
  const abOut = abTrade?.outputAmountWithoutFee?.quotient.toString()
  const baOut = baTrade?.outputAmountWithoutFee?.quotient.toString()
  const quoteError = quote?.error

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (quoteError) {
      setImpact(undefined)
      setError(quoteError)
    } else if (!loading && abIn && abOut && baOut) {
      // AB Trade is a SELL - we pass the inputAMount as the initial value
      // else we pass the outputAmount as the initialValue
      // Final value is the output of the BA trade as we always SELL in BA
      const impact = calculateFallbackPriceImpact(abIn, baOut)
      setImpact(impact)
      setError(undefined)
    } else {
      // reset all
      setImpact(undefined)
      setError(undefined)
    }
  }, [abIn, abOut, baOut, quoteError, loading, typedValue])

  return { impact, error, loading }
}
