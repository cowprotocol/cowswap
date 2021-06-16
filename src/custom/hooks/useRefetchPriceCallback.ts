import { BigNumber } from '@ethersproject/bignumber'
import { useCallback } from 'react'
import { useQuoteDispatchers } from 'state/price/hooks'
import { getCanonicalMarket, registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'
import {
  useAddGpUnsupportedToken,
  useIsUnsupportedTokenGp,
  useRemoveGpUnsupportedToken
} from 'state/lists/hooks/hooksMod'
import { FeeInformation, PriceInformation, QuoteInformationObject } from 'state/price/reducer'
import { AddGpUnsupportedTokenParams } from 'state/lists/actions'
import OperatorError, { ApiErrorCodeDetails, ApiErrorCodes } from 'utils/operator/error'
import { onlyResolvesLast } from 'utils/async'
import { ClearQuoteParams, SetQuoteErrorParams } from 'state/price/actions'
import { getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'

export interface RefetchQuoteCallbackParams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
  handlers: {
    setLoadingCallback: () => void
    hideLoadingCallback: () => void
  }
}

type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

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
      ? getPriceQuote({ chainId, baseToken, quoteToken, amount: exchangeAmount, kind })
      : // fee exceeds our price, is invalid
        Promise.reject(
          new OperatorError({
            errorType: ApiErrorCodes.FeeExceedsFrom,
            description: ApiErrorCodeDetails.FeeExceedsFrom
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
  clearQuote: (params: ClearQuoteParams) => void
  setQuoteError: (params: SetQuoteErrorParams) => void
}

function _handleQuoteError({
  quoteData,
  error,
  addUnsupportedToken,
  clearQuote,
  setQuoteError
}: HandleQuoteErrorParams) {
  if (_isValidOperatorError(error)) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        return addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now()
        })
      }
      // Fee/Price query returns error
      // e.g Insufficient Liquidity or Fee exceeds Price
      case ApiErrorCodes.FeeExceedsFrom:
      case ApiErrorCodes.NotFound: {
        console.error(`${error.message}: ${error.description}!`)
        return setQuoteError({
          ...quoteData,
          lastCheck: Date.now(),
          error: error.type
        })
      }
      default: {
        // some other operator error occurred, log it
        console.error(error)
        // Clear the quote
        return clearQuote({ chainId: quoteData.chainId, token: quoteData.sellToken })
      }
    }
  } else {
    // non-operator error log it
    console.error('An unknown error occurred:', error)
  }
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()
  // dispatchers
  const { updateQuote, clearQuote, setQuoteError } = useQuoteDispatchers()
  const addUnsupportedToken = useAddGpUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveGpUnsupportedToken()

  registerOnWindow({ updateQuote, addUnsupportedToken, removeGpUnsupportedToken })

  return useCallback(
    async (params: RefetchQuoteCallbackParams) => {
      let quoteData: FeeQuoteParams | QuoteInformationObject = params.quoteParams
      const { setLoadingCallback, hideLoadingCallback } = params.handlers

      const { sellToken, buyToken, chainId } = quoteData
      try {
        // set loading status
        setLoadingCallback()

        // Get the quote
        // price can be null if fee > price
        const { cancelled, data } = await getQuote(params)
        if (cancelled) {
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
          price: getPromiseFulfilledValue(price, undefined),
          lastCheck: Date.now()
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
        _handleQuoteError({
          error,
          quoteData,
          setQuoteError,
          clearQuote,
          addUnsupportedToken
        })
      } finally {
        // end loading status regardless of error or resolve
        hideLoadingCallback()
      }
    },
    [isUnsupportedTokenGp, updateQuote, removeGpUnsupportedToken, setQuoteError, clearQuote, addUnsupportedToken]
  )
}
