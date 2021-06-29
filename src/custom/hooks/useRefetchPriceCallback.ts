import { BigNumber } from '@ethersproject/bignumber'
import { useCallback } from 'react'
import { useQuoteDispatchers } from 'state/price/hooks'
import { QuoteError } from 'state/price/actions'

import {
  getCanonicalMarket,
  registerOnWindow,
  withTimeout,
  getPromiseFulfilledValue,
  isPromiseFulfilled
} from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote, PriceQuoteParams } from 'utils/operator'
import { getPriceQuote as getPriceQuoteParaswap, toPriceInformation } from 'utils/paraswap'
import {
  useAddGpUnsupportedToken,
  useIsUnsupportedTokenGp,
  useRemoveGpUnsupportedToken
} from 'state/lists/hooks/hooksMod'
import { FeeInformation, PriceInformation, QuoteInformationObject } from 'state/price/reducer'
import { AddGpUnsupportedTokenParams } from 'state/lists/actions'
import OperatorError, { ApiErrorCodes } from 'utils/operator/error'
import { onlyResolvesLast } from 'utils/async'
// import QuoteError, { QuoteErrorCodes, isValidQuoteError } from 'utils/operator/errors/QuoteError'
// import { ApiErrorCodes, isValidOperatorError } from 'utils/operator/errors/OperatorError'
import BigNumberJs from 'bignumber.js'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { PRICE_API_TIMEOUT_MS } from 'constants/index'

export interface RefetchQuoteCallbackParams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
  isPriceRefresh: boolean
}

type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

// const FEE_EXCEEDS_FROM_ERROR = new QuoteError({
//   errorType: QuoteErrorCodes.FeeExceedsFrom,
//   description: QuoteError.quoteErrorDetails.FeeExceedsFrom
// })

class PriceQuoteError extends Error {
  params: PriceQuoteParams
  results: PromiseSettledResult<any>[]

  constructor(message: string, params: PriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

type PriceSource = 'gnosis-protocol' | 'paraswap'
type PriceInformationWithSource = PriceInformation & { source: PriceSource; data?: any }
type PromiseRejectedResultWithSource = PromiseRejectedResult & { source: PriceSource }

/**
 *
 * @returns The best price among GPv2 API or Paraswap one
 */
async function _getBestPriceQuote(params: PriceQuoteParams): Promise<PriceInformation> {
  // Get price from all API: Gpv2 and Paraswap
  const pricePromise = withTimeout(getPriceQuote(params), PRICE_API_TIMEOUT_MS, 'GPv2: Get Price API')
  const paraSwapPricePromise = withTimeout(
    getPriceQuoteParaswap(params),
    PRICE_API_TIMEOUT_MS,
    'Paraswap: Get Price API'
  )

  // Get results from API queries
  const [priceResult, paraSwapPriceResult] = await Promise.allSettled([pricePromise, paraSwapPricePromise])

  // Prepare an array with all successful estimations
  const priceQuotes: Array<PriceInformationWithSource> = []
  const errorsGetPrice: Array<PromiseRejectedResultWithSource> = []

  if (isPromiseFulfilled(priceResult)) {
    priceQuotes.push({ ...priceResult.value, source: 'gnosis-protocol' })
  } else {
    errorsGetPrice.push({ ...priceResult, source: 'gnosis-protocol' })
  }

  if (isPromiseFulfilled(paraSwapPriceResult)) {
    const paraswapPrice = toPriceInformation(paraSwapPriceResult.value)
    paraswapPrice && priceQuotes.push({ ...paraswapPrice, source: 'paraswap', data: paraSwapPriceResult.value })
  } else {
    errorsGetPrice.push({ ...paraSwapPriceResult, source: 'paraswap' })
  }

  if (errorsGetPrice.length > 0) {
    const sourceNames = errorsGetPrice.map(e => e.source).join(', ')
    console.error('[hooks::useRefetchPriceCallback] Some API failed or timed out: ' + sourceNames, errorsGetPrice)
  }

  if (priceQuotes.length > 0) {
    const sourceNames = priceQuotes.map(p => p.source).join(', ')
    console.log('[hooks::useRefetchPriceCallback] Get best price succeeded for ' + sourceNames, priceQuotes)
    const amounts = priceQuotes.map(quote => quote.amount).filter(Boolean) as string[]

    // Take the best price: Aggregate all the amounts into a single one.
    //  - Use maximum of all the result for "Sell orders":
    //        You want to get the maximum number of buy tokens
    //  - Use minimum "Buy orders":
    //        You want to spend the min number of sell tokens
    const aggregationFunction = params.kind === OrderKind.SELL ? 'max' : 'min'
    const amount = BigNumberJs[aggregationFunction](...amounts).toString(10)
    const token = priceQuotes[0].token
    // console.log('Aggregated amounts', aggregationFunction, amounts, amount)

    const winningPrices = priceQuotes
      .filter(quote => quote.amount === amount)
      .map(p => p.source)
      .join(', ')
    console.log('[hooks::useRefetchPriceCallback] Winning price: ' + winningPrices)

    return { token, amount }
  } else {
    throw new PriceQuoteError('Error querying price from APIs', params, [priceResult, paraSwapPriceResult])
  }
}

async function _getQuote({ quoteParams, fetchFee, previousFee }: RefetchQuoteCallbackParams): Promise<QuoteResult> {
  const { sellToken, buyToken, amount, kind, chainId } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })

  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? getFeeQuote({ chainId, sellToken, buyToken, amount, kind })
      : Promise.resolve(previousFee)

  // Get a new price quote
  let exchangeAmount
  let feeExceedsPrice = false
  if (kind === 'sell') {
    // Sell orders need to deduct the fee from the swapped amount
    // we need to check for 0/negative exchangeAmount should fee >= amount
    const { amount: fee } = await feePromise
    const result = BigNumber.from(amount).sub(fee)

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? _getBestPriceQuote({ chainId, baseToken, quoteToken, amount: exchangeAmount, kind })
      : // fee exceeds our price, is invalid
        Promise.reject(
          new OperatorError({
            errorType: ApiErrorCodes.FeeExceedsFrom,
            description: OperatorError.apiErrorDetails.FeeExceedsFrom
          })
        )

  // Promise.allSettled does NOT throw on 1 promise rejection
  // instead it returns PromiseSettledResult - which we can decide to consume later
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
  return Promise.allSettled([pricePromise, feePromise])
}

// wrap _getQuote and only resolve once on several calls
const getQuote = onlyResolvesLast<QuoteResult>(_getQuote)

function _isValidOperatorError(error: any): error is OperatorError {
  return error instanceof OperatorError
}

interface HandleQuoteErrorParams {
  quoteData: QuoteInformationObject | FeeQuoteParams
  error: unknown
  addUnsupportedToken: (params: AddGpUnsupportedTokenParams) => void
}

function _handleQuoteError({ quoteData, error, addUnsupportedToken }: HandleQuoteErrorParams): QuoteError {
  if (_isValidOperatorError(error)) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now()
        })

        return 'unsupported-token'
      }

      case ApiErrorCodes.FeeExceedsFrom: {
        return 'fee-exceeds-sell-amount'
      }

      case ApiErrorCodes.NotFound: {
        console.error(`Insufficient liquidity ${error.message}: ${error.description}`)
        return 'insufficient-liquidity'
      }

      default: {
        // some other operator error occurred, log it
        console.error('Error quoting price/fee. Unhandled operator error: ' + error.type, error)

        return 'fetch-quote-error'
      }
    }
  } else {
    // non-operator error log it
    console.error('Error quoting price/fee: ' + error)
    return 'fetch-quote-error'
  }
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()
  // dispatchers
  const { getNewQuoteStart, refreshQuoteStart, updateQuote, setQuoteError } = useQuoteDispatchers()
  const addUnsupportedToken = useAddGpUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveGpUnsupportedToken()

  registerOnWindow({
    getNewQuoteStart,
    refreshQuoteStart,
    updateQuote,
    setQuoteError,
    addUnsupportedToken,
    removeGpUnsupportedToken
  })

  return useCallback(
    async (params: RefetchQuoteCallbackParams) => {
      const { quoteParams, isPriceRefresh } = params
      let quoteData: FeeQuoteParams | QuoteInformationObject = quoteParams

      const { sellToken, buyToken, chainId } = quoteData
      try {
        // Start action: Either new quote or refreshing quote
        if (isPriceRefresh) {
          // Refresh the quote
          refreshQuoteStart()
        } else {
          // Get new quote
          getNewQuoteStart({ sellToken, chainId })
        }

        // Get the quote
        // price can be null if fee > price
        const { cancelled, data } = await getQuote(params)
        if (cancelled) {
          // Cancellation can happen if a new request is made, then any ongoing query is canceled
          console.debug('[useRefetchPriceCallback] Canceled get quote price for', params)
          return
        }

        const [price, fee] = data as QuoteResult

        // Promise.allSettled (L68) does NOT throw whole promise on first reject
        // we don't want it to, we are waiting for FEE and PRICE, if only one fails, why throw both away?
        // e.g FEE comes in OK, but Fee > Price, we throw an FEE_EXCEEDS_PRICE error but keep fee promise resolved value
        // to save into state and use
        quoteData = {
          ...params.quoteParams,
          fee: getPromiseFulfilledValue(fee, undefined),
          price: getPromiseFulfilledValue(price, undefined)
        }

        // check the PromiseSettledValue/PromiseRejectedResult
        // returned by Promise.allSettled
        if (!isPromiseFulfilled(fee)) {
          // fee error takes precedence
          throw fee.reason
        } else if (!isPromiseFulfilled(price)) {
          throw price.reason
        }

        const previouslyUnsupportedToken = isUnsupportedTokenGp(sellToken) || isUnsupportedTokenGp(buyToken)
        // can be a previously unsupported token which is now valid
        // so we check against map and remove it
        if (previouslyUnsupportedToken) {
          console.debug('[useRefetchPriceCallback]::Previously unsupported token now supported - re-enabling.')

          removeGpUnsupportedToken({
            chainId,
            address: previouslyUnsupportedToken.address.toLowerCase()
          })
        }

        // Update quote
        updateQuote(quoteData)
      } catch (error) {
        // handle any errors in quote fetch
        // we re-use the quoteData object in scope to save values into state
        const quoteError = _handleQuoteError({
          error,
          quoteData,
          addUnsupportedToken
        })

        // Set quote error
        setQuoteError({
          ...quoteData,
          error: quoteError
        })
      }
    },
    [
      isUnsupportedTokenGp,
      updateQuote,
      removeGpUnsupportedToken,
      setQuoteError,
      addUnsupportedToken,
      getNewQuoteStart,
      refreshQuoteStart
    ]
  )
}
