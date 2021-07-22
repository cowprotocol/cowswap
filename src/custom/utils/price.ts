import { BigNumber } from '@ethersproject/bignumber'
import BigNumberJs from 'bignumber.js'

import { getFeeQuote, getPriceQuote as getPriceQuoteGp, OrderMetaData } from 'utils/operator'
import GpQuoteError, { GpQuoteErrorCodes } from 'utils/operator/errors/QuoteError'
import { getCanonicalMarket, isPromiseFulfilled, withTimeout } from 'utils/misc'
import { formatAtoms } from 'utils/format'
import { PRICE_API_TIMEOUT_MS } from 'constants/index'
import { getPriceQuote as getPriceQuoteParaswap, toPriceInformation } from 'utils/paraswap'

import { OptimalRatesWithPartnerFees as OptimalRatesWithPartnerFeesParaswap } from 'paraswap'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from 'state/lists/actions'

const FEE_EXCEEDS_FROM_ERROR = new GpQuoteError({
  errorType: GpQuoteErrorCodes.FeeExceedsFrom,
  description: GpQuoteError.quoteErrorDetails.FeeExceedsFrom,
})

export interface QuoteParams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
  isPriceRefresh: boolean
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

export interface PriceInformation {
  token: string
  amount: string | null
}

export class PriceQuoteError extends Error {
  params: PriceQuoteParams
  results: PromiseSettledResult<any>[]

  constructor(message: string, params: PriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

export type FeeQuoteParams = Pick<OrderMetaData, 'sellToken' | 'buyToken' | 'kind'> & {
  amount: string
  fromDecimals: number
  toDecimals: number
  chainId: ChainId
}

export type PriceQuoteParams = Omit<FeeQuoteParams, 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
  fromDecimals: number
  toDecimals: number
}

export type PriceSource = 'gnosis-protocol' | 'paraswap'
export type PriceInformationWithSource = PriceInformation & { source: PriceSource; data?: any }
export type PromiseRejectedResultWithSource = PromiseRejectedResult & { source: PriceSource }

interface GetBestPriceOptions {
  aggrOverride?: 'max' | 'min'
}

type FilterWinningPriceParams = {
  kind: string
  amounts: string[]
  priceQuotes: PriceInformationWithSource[]
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

/**
 *  Return all price estimations from all price sources
 */
export async function getAllPrices(params: PriceQuoteParams) {
  // Get price from all API: Gpv2 and Paraswap
  const pricePromise = withTimeout(getPriceQuoteGp(params), PRICE_API_TIMEOUT_MS, 'GPv2: Get Price API')
  const paraSwapPricePromise = withTimeout(
    getPriceQuoteParaswap(params),
    PRICE_API_TIMEOUT_MS,
    'Paraswap: Get Price API'
  )

  // Get results from API queries
  return Promise.allSettled([pricePromise, paraSwapPricePromise])
}

/**
 * Auxiliary function that would take the settled results from all price feeds (resolved/rejected), and group them by
 * successful price quotes and errors price quotes. For each price, it also give the context (the name of the price feed)
 */
function _extractPriceAndErrorPromiseValues(
  gpPriceResult: PromiseSettledResult<PriceInformation>,
  paraSwapPriceResult: PromiseSettledResult<OptimalRatesWithPartnerFeesParaswap | null>
): [Array<PriceInformationWithSource>, Array<PromiseRejectedResultWithSource>] {
  // Prepare an array with all successful estimations
  const priceQuotes: Array<PriceInformationWithSource> = []
  const errorsGetPrice: Array<PromiseRejectedResultWithSource> = []

  if (isPromiseFulfilled(gpPriceResult)) {
    priceQuotes.push({ ...gpPriceResult.value, source: 'gnosis-protocol' })
  } else {
    errorsGetPrice.push({ ...gpPriceResult, source: 'gnosis-protocol' })
  }

  if (isPromiseFulfilled(paraSwapPriceResult)) {
    const paraswapPrice = toPriceInformation(paraSwapPriceResult.value)
    paraswapPrice && priceQuotes.push({ ...paraswapPrice, source: 'paraswap', data: paraSwapPriceResult.value })
  } else {
    errorsGetPrice.push({ ...paraSwapPriceResult, source: 'paraswap' })
  }

  return [priceQuotes, errorsGetPrice]
}

/**
 *  Return the best price considering all price feeds
 */
export async function getBestPrice(params: PriceQuoteParams, options?: GetBestPriceOptions): Promise<PriceInformation> {
  // Get all prices
  const [priceResult, paraSwapPriceResult] = await getAllPrices(params)

  // Aggregate successful and error prices
  const [priceQuotes, errorsGetPrice] = _extractPriceAndErrorPromiseValues(priceResult, paraSwapPriceResult)

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
    throw new PriceQuoteError('Error querying price from APIs', params, [priceResult, paraSwapPriceResult])
  }
}

/**
 *  Return the best quote considering all price feeds. The quote contains information about the price and fee
 */
export async function getBestQuote({ quoteParams, fetchFee, previousFee }: QuoteParams): Promise<QuoteResult> {
  const { sellToken, buyToken, fromDecimals, toDecimals, amount, kind, chainId } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })

  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? getFeeQuote({ chainId, sellToken, buyToken, fromDecimals, toDecimals, amount, kind })
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
      ? getBestPrice({ chainId, baseToken, quoteToken, fromDecimals, toDecimals, amount: exchangeAmount, kind })
      : // fee exceeds our price, is invalid
        Promise.reject(FEE_EXCEEDS_FROM_ERROR)

  return Promise.allSettled([pricePromise, feePromise])
}
