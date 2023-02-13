import { BigNumber } from '@ethersproject/bignumber'
import BigNumberJs from 'bignumber.js'
import * as Sentry from '@sentry/browser'
import { Percent } from '@uniswap/sdk-core'

import { getQuote, getPriceQuoteLegacy as getPriceQuoteGp } from '@cow/api/gnosisProtocol'
import GpQuoteError, { GpQuoteErrorCodes } from '@cow/api/gnosisProtocol/errors/QuoteError'
import { getCanonicalMarket, isPromiseFulfilled, withTimeout } from 'utils/misc'
import { PRICE_API_TIMEOUT_MS, SWR_OPTIONS } from 'constants/index'
import {
  getPriceQuote as getPriceQuoteParaswap,
  toPriceInformation as toPriceInformationParaswap,
} from '@cow/api/paraswap'
import {
  getPriceQuote as getPriceQuoteMatcha,
  MatchaPriceQuote,
  toPriceInformation as toPriceInformationMatcha,
} from '@cow/api/matcha-0x'

import { OptimalRate } from 'paraswap-core'
import { OrderKind } from '@cowprotocol/contracts'
import { toErc20Address } from 'utils/tokens'
import {
  LegacyFeeQuoteParams,
  LegacyPriceInformationWithSource,
  LegacyPriceQuoteError,
  LegacyPriceQuoteParams,
  LegacyPromiseRejectedResultWithSource,
  LegacyQuoteParams,
} from '@cow/api/gnosisProtocol/legacy/types'
import { FeeInformation, PriceInformation } from '@cowprotocol/cow-sdk'
import useSWR, { SWRConfiguration } from 'swr'
import { getUsdQuoteValidTo } from 'hooks/useStablecoinPrice'
import { GpPriceStrategy } from 'state/gas/atoms'

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
}

/**
 *  Return all price estimations from all price sources
 */
export async function getAllPrices(params: LegacyPriceQuoteParams): Promise<AllPricesResult> {
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

  return [priceQuotes, errorsGetPrice]
}

/**
 *  Return the best price considering all price feeds
 */
export async function getBestPrice(
  params: LegacyPriceQuoteParams,
  options?: GetBestPriceOptions
): Promise<PriceInformation> {
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
 * getFullQuote
 * Queries the new Quote api endpoint found here: https://protocol-mainnet.gnosis.io/api/#/default/post_api_v1_quote
 * TODO: consider name // check with backend when logic returns best quote, not first
 */
export async function getFullQuote({ quoteParams }: { quoteParams: LegacyFeeQuoteParams }): Promise<QuoteResult> {
  const { kind } = quoteParams
  const { quote, expiration: expirationDate, id: quoteId } = await getQuote(quoteParams)

  const price = {
    amount: kind === OrderKind.SELL ? quote.buyAmount : quote.sellAmount,
    token: kind === OrderKind.SELL ? quote.buyToken : quote.sellToken,
    quoteId: quoteId ?? undefined,
  }
  const fee = {
    amount: quote.feeAmount,
    expirationDate,
  }

  return Promise.allSettled([price, fee])
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

// TODO: move to state/orders/priceUtils
function formatAtoms(amount: string, decimals: number): string {
  return BigNumberJs(amount)
    .div(10 ** decimals)
    .toString()
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

export async function getBestQuote({
  quoteParams,
  fetchFee,
  previousFee,
  strategy,
}: LegacyQuoteParams): Promise<QuoteResult> {
  if (strategy === 'COWSWAP') {
    console.debug('[GP PRICE::API] getBestQuote - Attempting best quote retrieval using COWSWAP strategy, hang tight.')

    return getFullQuote({ quoteParams }).catch((err) => {
      console.warn(
        '[GP PRICE::API] getBestQuote - error using COWSWAP price strategy, reason: [',
        err,
        '] - trying back up price sources...'
      )
      // ATTEMPT LEGACY CALL
      return getBestQuote({ strategy: 'LEGACY', quoteParams, fetchFee, previousFee, isPriceRefresh: false })
    })
  } else {
    console.debug('[GP PRICE::API] getBestQuote - Attempting best quote retrieval using LEGACY strategy, hang tight.')

    return getBestQuoteLegacy({ quoteParams, fetchFee, previousFee, isPriceRefresh: false })
  }
}

export async function getFastQuote({ quoteParams }: LegacyQuoteParams): Promise<QuoteResult> {
  console.debug('[GP PRICE::API] getFastQuote - Attempting fast quote retrieval, hang tight.')

  return getFullQuote({ quoteParams })
}

export function getValidParams(params: LegacyPriceQuoteParams) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, chainId } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken }
}

export function calculateFallbackPriceImpact(initialValue: string, finalValue: string) {
  const initialValueBn = new BigNumberJs(initialValue)
  const finalValueBn = new BigNumberJs(finalValue)
  // ((finalValue - initialValue) / initialValue / 2) * 100
  const output = finalValueBn.minus(initialValueBn).div(initialValueBn).div('2')
  const [numerator, denominator] = output.toFraction()

  const isPositive = numerator.isNegative() === denominator.isNegative()

  const percentage = new Percent(numerator.abs().toString(10), denominator.abs().toString(10))
  // UI shows NEGATIVE impact as a POSITIVE effect, so we need to swap the sign here
  // see FiatValue: line 38
  const impact = isPositive ? percentage.multiply('-1') : percentage

  console.debug(`[calculateFallbackPriceImpact]::${impact.toSignificant(2)}%`)

  return impact
}

export async function getGpUsdcPrice({ strategy, quoteParams }: Pick<LegacyQuoteParams, 'strategy' | 'quoteParams'>) {
  if (strategy === 'COWSWAP') {
    console.debug(
      '[GP PRICE::API] getGpUsdcPrice - Attempting best USDC quote retrieval using COWSWAP strategy, hang tight.'
    )
    // we need to explicitly set the validTo time to 10m in future on every call
    quoteParams.validTo = getUsdQuoteValidTo()
    const { quote } = await getQuote(quoteParams)

    return quote.sellAmount
  } else {
    console.debug(
      '[GP PRICE::API] getGpUsdcPrice - Attempting best USDC quote retrieval using LEGACY strategy, hang tight.'
    )
    // legacy
    const legacyParams = {
      ...quoteParams,
      baseToken: quoteParams.buyToken,
      quoteToken: quoteParams.sellToken,
    }

    const quote = await getBestPrice(legacyParams)

    return quote.amount
  }
}

export function useGetGpUsdcPrice(
  props: {
    strategy: GpPriceStrategy
    quoteParams: LegacyFeeQuoteParams | null
  },
  options: SWRConfiguration = SWR_OPTIONS
) {
  const { strategy, quoteParams } = props

  return useSWR<string | null>(
    ['getGpUsdcPrice', strategy, quoteParams],
    () => {
      if (strategy && quoteParams) {
        return getGpUsdcPrice({ strategy, quoteParams })
      } else {
        return null
      }
    },
    options
  )
}
