import { BigNumber } from '@ethersproject/bignumber'
import BigNumberJs from 'bignumber.js'

import { getFeeQuote, getPriceQuote as getPriceQuoteGp, OrderMetaData } from 'api/gnosisProtocol'
import GpQuoteError, { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'
import { getCanonicalMarket, isPromiseFulfilled, withTimeout } from 'utils/misc'
import { formatAtoms } from 'utils/format'
import { PRICE_API_TIMEOUT_MS } from 'constants/index'
import { getPriceQuote as getPriceQuoteParaswap, toPriceInformation as toPriceInformationParaswap } from 'api/paraswap'
import {
  getPriceQuote as getPriceQuoteMatcha,
  MatchaPriceQuote,
  toPriceInformation as toPriceInformationMatcha,
} from 'api/matcha-0x'

import { OptimalRate } from 'paraswap-core'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { ChainId } from 'state/lists/actions'
import { toErc20Address } from 'utils/tokens'

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
  userAddress?: string | null
}

export type PriceQuoteParams = Omit<FeeQuoteParams, 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
  fromDecimals: number
  toDecimals: number
  userAddress?: string | null
}

export type PriceSource = 'gnosis-protocol' | 'paraswap' | 'matcha-0x'
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
export type AllPricesResult = {
  gpPriceResult: PromiseSettledResult<PriceInformation | null>
  paraSwapPriceResult: PromiseSettledResult<OptimalRate | null>
  matcha0xPriceResult: PromiseSettledResult<MatchaPriceQuote | null>
}

/**
 *  Return all price estimations from all price sources
 */
export async function getAllPrices(params: PriceQuoteParams): Promise<AllPricesResult> {
  // Get price from all API: Gpv2, Paraswap, Matcha (0x)
  const gpPricePromise = withTimeout(getPriceQuoteGp(params), PRICE_API_TIMEOUT_MS, 'GPv2: Get Price API')

  const paraSwapPricePromise = withTimeout(
    getPriceQuoteParaswap(params),
    PRICE_API_TIMEOUT_MS,
    'Paraswap: Get Price API'
  )
  const matchaPricePromise = withTimeout(getPriceQuoteMatcha(params), PRICE_API_TIMEOUT_MS, 'Matcha(0x): Get Price API')

  // Get results from API queries
  const [gpPrice, paraSwapPrice, matchaPrice] = await Promise.allSettled([
    gpPricePromise,
    paraSwapPricePromise,
    matchaPricePromise,
  ])

  return {
    gpPriceResult: gpPrice,
    paraSwapPriceResult: paraSwapPrice,
    matcha0xPriceResult: matchaPrice,
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
  matchaPriceResult: PromiseSettledResult<MatchaPriceQuote | null>
): [Array<PriceInformationWithSource>, Array<PromiseRejectedResultWithSource>] {
  // Prepare an array with all successful estimations
  const priceQuotes: Array<PriceInformationWithSource> = []
  const errorsGetPrice: Array<PromiseRejectedResultWithSource> = []

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

  return [priceQuotes, errorsGetPrice]
}

/**
 *  Return the best price considering all price feeds
 */
export async function getBestPrice(params: PriceQuoteParams, options?: GetBestPriceOptions): Promise<PriceInformation> {
  // Get all prices
  const { gpPriceResult, paraSwapPriceResult, matcha0xPriceResult } = await getAllPrices(params)

  // Aggregate successful and error prices
  const [priceQuotes, errorsGetPrice] = _extractPriceAndErrorPromiseValues(
    // we pass the kind of trade here as matcha doesn't have an easy way to differentiate
    params.kind,
    gpPriceResult,
    paraSwapPriceResult,
    matcha0xPriceResult
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
    throw new PriceQuoteError('Error querying price from APIs', params, [gpPriceResult, paraSwapPriceResult])
  }
}

/**
 *  Return the best quote considering all price feeds. The quote contains information about the price and fee
 */
export async function getBestQuote({ quoteParams, fetchFee, previousFee }: QuoteParams): Promise<QuoteResult> {
  const { sellToken, buyToken, fromDecimals, toDecimals, amount, kind, chainId, userAddress } = quoteParams
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
      ? getBestPrice({
          chainId,
          baseToken,
          quoteToken,
          fromDecimals,
          toDecimals,
          amount: exchangeAmount,
          kind,
          userAddress,
        })
      : // fee exceeds our price, is invalid
        Promise.reject(FEE_EXCEEDS_FROM_ERROR)

  return Promise.allSettled([pricePromise, feePromise])
}

export function getValidParams(params: PriceQuoteParams) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, chainId } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken }
}
