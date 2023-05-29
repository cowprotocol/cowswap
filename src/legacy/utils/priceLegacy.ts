import { OrderKind } from '@cowprotocol/contracts'
import { BigNumber } from '@ethersproject/bignumber'

import * as Sentry from '@sentry/browser'
import BigNumberJs from 'bignumber.js'
import { OptimalRate } from 'paraswap-core'
import { FeeInformation, PriceInformation } from 'types'

import { PRICE_API_TIMEOUT_MS } from 'legacy/constants'
import { getCanonicalMarket, isPromiseFulfilled, withTimeout } from 'legacy/utils/misc'

import {
  getPriceQuote as getPriceQuote1inch,
  PriceQuote1inch,
  toPriceInformation as toPriceInformation1inch,
} from 'api/1inch'
import { getQuote } from 'api/gnosisProtocol'
import GpQuoteError, { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'
import {
  LegacyPriceInformationWithSource,
  LegacyPriceQuoteError,
  LegacyPriceQuoteParams,
  LegacyPromiseRejectedResultWithSource,
  LegacyQuoteParams,
} from 'api/gnosisProtocol/legacy/types'
import {
  getPriceQuote as getPriceQuoteMatcha,
  MatchaPriceQuote,
  toPriceInformation as toPriceInformationMatcha,
} from 'api/matcha-0x'
import { getPriceQuote as getPriceQuoteParaswap, toPriceInformation as toPriceInformationParaswap } from 'api/paraswap'

/**
 * ************************************************** *
 * ************************************************** *
 * *******************   WARNING   ****************** *
 * **   USE THIS FILE ONLY THROUGH LAZY LOADING   *** *
 * ************************************************** *
 * ************************************************** *
 */

const FEE_EXCEEDS_FROM_ERROR = new GpQuoteError({
  errorType: GpQuoteErrorCodes.FeeExceedsFrom,
  description: GpQuoteError.quoteErrorDetails.FeeExceedsFrom,
})

interface GetBestPriceOptions {
  aggrOverride?: 'max' | 'min'
}

type FilterWinningPriceParams = {
  kind: string
  amounts: string[]
  priceQuotes: LegacyPriceInformationWithSource[]
} & GetBestPriceOptions

function _filterWinningPrice(params: FilterWinningPriceParams) {
  // Take the best price: Aggregate all the amounts into a single one.
  //  - Use maximum of all the result for "Sell orders":
  //        You want to get the maximum number of buy tokens
  //  - Use minimum "Buy orders":
  //        You want to spend the min number of sell tokens
  const aggregationFunction = params.aggrOverride || params.kind === OrderKind.SELL ? 'max' : 'min'
  const amount = BigNumberJs[aggregationFunction](...params.amounts).toString(10)
  const token = params.priceQuotes[0].token

  const winningPrices = params.priceQuotes
    .filter((quote) => quote.amount === amount)
    .map((p) => p.source)
    .join(', ')
  console.debug('[util::filterWinningPrice] Winning price: ' + winningPrices + ' for token ' + token + ' @', amount)

  return { token, amount }
}

export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]
export type AllPricesResult = {
  gpPriceResult: PromiseSettledResult<PriceInformation | null>
  paraSwapPriceResult: PromiseSettledResult<OptimalRate | null>
  matcha0xPriceResult: PromiseSettledResult<MatchaPriceQuote | null>
  oneInchPriceResult: PromiseSettledResult<PriceQuote1inch | null>
}

/**
 *  Return all price estimations from all price sources
 */
async function getAllPrices(params: LegacyPriceQuoteParams): Promise<AllPricesResult> {
  const paraSwapPricePromise = withTimeout(
    getPriceQuoteParaswap(params),
    PRICE_API_TIMEOUT_MS,
    'Paraswap: Get Price API'
  )
  const matchaPricePromise = withTimeout(getPriceQuoteMatcha(params), PRICE_API_TIMEOUT_MS, 'Matcha(0x): Get Price API')

  const oneInchPricePromise = withTimeout(getPriceQuote1inch(params), PRICE_API_TIMEOUT_MS, '1inch: Get Price API')

  // Get results from API queries
  const [paraSwapPrice, matchaPrice, oneInchPrice] = await Promise.allSettled([
    paraSwapPricePromise,
    matchaPricePromise,
    oneInchPricePromise,
  ])

  return {
    // Warning!
    // /markets endpoint was deleted, so we just skip it
    gpPriceResult: { status: 'fulfilled', value: null },
    paraSwapPriceResult: paraSwapPrice,
    matcha0xPriceResult: matchaPrice,
    oneInchPriceResult: oneInchPrice,
  }
}

/**
 * Auxiliary function that would take the settled results from all price feeds (resolved/rejected), and group them by
 * successful price quotes and errors price quotes. For each price, it also give the context (the name of the price feed)
 */
function _extractPriceAndErrorPromiseValues(
  // we pass the kind of trade here as matcha doesn't have an easy way to differentiate
  kind: OrderKind,
  gpPriceResult: PromiseSettledResult<PriceInformation | null>,
  paraSwapPriceResult: PromiseSettledResult<OptimalRate | null>,
  matchaPriceResult: PromiseSettledResult<MatchaPriceQuote | null>,
  oneInchPriceResult: PromiseSettledResult<PriceQuote1inch | null>
): [Array<LegacyPriceInformationWithSource>, Array<LegacyPromiseRejectedResultWithSource>] {
  // Prepare an array with all successful estimations
  const priceQuotes: Array<LegacyPriceInformationWithSource> = []
  const errorsGetPrice: Array<LegacyPromiseRejectedResultWithSource> = []

  if (isPromiseFulfilled(gpPriceResult)) {
    const gpPrice = gpPriceResult.value
    if (gpPrice) {
      priceQuotes.push({ ...gpPrice, source: 'gnosis-protocol' })
    }
  } else {
    errorsGetPrice.push({ ...gpPriceResult, source: 'gnosis-protocol' })
  }

  if (isPromiseFulfilled(paraSwapPriceResult)) {
    const paraswapPrice = toPriceInformationParaswap(paraSwapPriceResult.value)
    if (paraswapPrice) {
      priceQuotes.push({ ...paraswapPrice, source: 'paraswap', data: paraSwapPriceResult.value })
    }
  } else {
    errorsGetPrice.push({ ...paraSwapPriceResult, source: 'paraswap' })
  }

  if (isPromiseFulfilled(matchaPriceResult)) {
    const matchaPrice = toPriceInformationMatcha(matchaPriceResult.value, kind)
    if (matchaPrice) {
      priceQuotes.push({ ...matchaPrice, source: 'matcha-0x', data: matchaPriceResult.value })
    }
  } else {
    errorsGetPrice.push({ ...matchaPriceResult, source: 'matcha-0x' })
  }

  if (isPromiseFulfilled(oneInchPriceResult)) {
    const oneInchPrice = toPriceInformation1inch(oneInchPriceResult.value)
    if (oneInchPrice) {
      priceQuotes.push({ ...oneInchPrice, source: '1inch', data: oneInchPrice.amount })
    }
  } else {
    errorsGetPrice.push({ ...oneInchPriceResult, source: '1inch' })
  }

  return [priceQuotes, errorsGetPrice]
}

function _checkFeeErrorForData(error: GpQuoteError) {
  console.warn('[getBestQuote:Legacy]::Fee error', error)

  const feeAmount = error?.data?.fee_amount || error?.data?.feeAmount
  const feeExpiration = error?.data?.expiration
  // check if our error response has any fee data attached to it
  if (feeAmount) {
    return {
      amount: feeAmount,
      expirationDate: feeExpiration,
    }
  } else {
    // no data object, just rethrow
    throw error
  }
}

function formatAtoms(amount: string, decimals: number): string {
  return BigNumberJs(amount)
    .div(10 ** decimals)
    .toString()
}

/**
 *  Return the best price considering all price feeds
 */
export async function getBestPrice(
  params: LegacyPriceQuoteParams,
  options?: GetBestPriceOptions
): Promise<PriceInformation> {
  // Get all prices
  const { gpPriceResult, paraSwapPriceResult, matcha0xPriceResult, oneInchPriceResult } = await getAllPrices(params)

  // Aggregate successful and error prices
  const [priceQuotes, errorsGetPrice] = _extractPriceAndErrorPromiseValues(
    // we pass the kind of trade here as matcha doesn't have an easy way to differentiate
    params.kind,
    gpPriceResult,
    paraSwapPriceResult,
    matcha0xPriceResult,
    oneInchPriceResult
  )

  // Print prices who failed to be fetched
  if (errorsGetPrice.length > 0) {
    const sourceNames = errorsGetPrice.map((e) => e.source).join(', ')
    console.error('[utils::useRefetchPriceCallback] Some API failed or timed out: ' + sourceNames, errorsGetPrice)
  }

  if (priceQuotes.length > 0) {
    // At least we have one successful price
    const sourceNames = priceQuotes.map((p) => p.source).join(', ')
    console.log('[utils::useRefetchPriceCallback] Get best price succeeded for ' + sourceNames, priceQuotes)
    const amounts = priceQuotes.map((quote) => quote.amount).filter(Boolean) as string[]

    return _filterWinningPrice({ ...options, kind: params.kind, amounts, priceQuotes })
  } else {
    // It was not possible to get a price estimation
    const priceQuoteError = new LegacyPriceQuoteError('Error querying price from APIs', params, [
      gpPriceResult,
      paraSwapPriceResult,
      matcha0xPriceResult,
    ])

    const sentryError = new Error()
    Object.assign(sentryError, priceQuoteError, {
      message: `Error querying best price from APIs`,
      name: 'PriceErrorObject',
    })

    // report this to sentry
    Sentry.captureException(sentryError, {
      tags: { errorType: 'getBestPrice' },
      contexts: { params },
    })

    throw priceQuoteError
  }
}

/**
 * (LEGACY) Will be overwritten in the near future
 *  Return the best quote considering all price feeds. The quote contains information about the price and fee
 */
export async function getBestQuoteLegacy({
  quoteParams,
  fetchFee,
  previousFee,
}: Omit<LegacyQuoteParams, 'strategy'>): Promise<QuoteResult> {
  const { sellToken, buyToken, fromDecimals, toDecimals, amount, kind, chainId, userAddress, validTo } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })
  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? getQuote(quoteParams)
          .then((resp) => ({ amount: resp.quote.feeAmount, expirationDate: resp.expiration }))
          .catch(_checkFeeErrorForData)
      : Promise.resolve(previousFee)

  // Get a new price quote
  let exchangeAmount
  let feeExceedsPrice = false
  if (kind === 'sell') {
    // Sell orders need to deduct the fee from the swapped amount
    // we need to check for 0/negative exchangeAmount should fee >= amount
    const { amount: fee } = await feePromise
    const result = BigNumber.from(amount).sub(fee)
    console.log(`Sell amount before fee: ${formatAtoms(amount, fromDecimals)}  (in atoms ${amount})`)
    console.log(`Sell amount after fee: ${formatAtoms(result.toString(), fromDecimals)}  (in atoms ${result})`)

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? getBestPrice({
          chainId,
          baseToken,
          quoteToken,
          fromDecimals,
          toDecimals,
          amount: exchangeAmount,
          kind,
          userAddress,
          validTo,
        })
      : // fee exceeds our price, is invalid
        Promise.reject(FEE_EXCEEDS_FROM_ERROR)

  return Promise.allSettled([pricePromise, feePromise])
}
