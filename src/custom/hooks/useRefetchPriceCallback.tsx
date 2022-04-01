import { useCallback } from 'react'

import { FeeQuoteParams, getBestQuote, getFastQuote, QuoteParams, QuoteResult } from 'utils/price'
import { isValidOperatorError, ApiErrorCodes } from 'api/gnosisProtocol/errors/OperatorError'
import GpQuoteError, {
  GpQuoteErrorCodes,
  GpQuoteErrorDetails,
  isValidQuoteError,
} from 'api/gnosisProtocol/errors/QuoteError'
import { registerOnWindow, getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'

import { isOnline } from 'hooks/useIsOnline'
import {
  useAddGpUnsupportedToken,
  useIsUnsupportedTokenGp,
  useRemoveGpUnsupportedToken,
} from 'state/lists/hooks/hooksMod'
import { QuoteInformationObject } from 'state/price/reducer'
import { useQuoteDispatchers } from 'state/price/hooks'
import { AddGpUnsupportedTokenParams } from 'state/lists/actions'
import { QuoteError } from 'state/price/actions'
import { CancelableResult, onlyResolvesLast } from 'utils/async'
import useGetGpPriceStrategy from 'hooks/useGetGpPriceStrategy'
import { calculateValidTo } from 'hooks/useSwapCallback'
import { useUserTransactionTTL } from 'state/user/hooks'

interface HandleQuoteErrorParams {
  quoteData: QuoteInformationObject | FeeQuoteParams
  error: unknown
  addUnsupportedToken: (params: AddGpUnsupportedTokenParams) => void
}

type QuoteParamsForFetching = Omit<QuoteParams, 'strategy'>

export function handleQuoteError({ quoteData, error, addUnsupportedToken }: HandleQuoteErrorParams): QuoteError {
  if (isValidOperatorError(error)) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now(),
        })

        return 'unsupported-token'
      }

      default: {
        // some other operator error occurred, log it
        console.error('Error quoting price/fee. Unhandled operator error: ' + error.type, error)

        return 'fetch-quote-error'
      }
    }
  } else if (isValidQuoteError(error)) {
    switch (error.type) {
      // Fee/Price query returns error
      // e.g Insufficient Liquidity or Fee exceeds Price
      case GpQuoteErrorCodes.FeeExceedsFrom: {
        return 'fee-exceeds-sell-amount'
      }

      case GpQuoteErrorCodes.ZeroPrice: {
        return 'zero-price'
      }

      case GpQuoteErrorCodes.InsufficientLiquidity: {
        console.error(`Insufficient liquidity ${error.message}: ${error.description}`)
        return 'insufficient-liquidity'
      }

      case GpQuoteErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now(),
        })

        return 'unsupported-token'
      }

      case GpQuoteErrorCodes.TransferEthToContract: {
        return 'transfer-eth-to-smart-contract'
      }

      default: {
        // Some other operator error occurred, log it
        console.error('Error quoting price/fee. Unhandled operator error: ' + error.type, error)

        return 'fetch-quote-error'
      }
    }
  } else {
    // Detect if the error was because we are now offline
    if (!isOnline()) {
      return 'offline-browser'
    }

    // Some other error getting the quote ocurred
    console.error('Error quoting price/fee: ' + error)
    return 'fetch-quote-error'
  }
}

const getBestQuoteResolveOnlyLastCall = onlyResolvesLast<QuoteResult>(getBestQuote)
const getFastQuoteResolveOnlyLastCall = onlyResolvesLast<QuoteResult>(getFastQuote)

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()
  // dispatchers
  const { getNewQuote, refreshQuote, updateQuote, setQuoteError } = useQuoteDispatchers()
  const addUnsupportedToken = useAddGpUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveGpUnsupportedToken()
  // check which price strategy to use (COWSWAP/LEGACY)
  const priceStrategy = useGetGpPriceStrategy()
  const [deadline] = useUserTransactionTTL()

  registerOnWindow({
    getNewQuote,
    refreshQuote,
    updateQuote,
    setQuoteError,
    addUnsupportedToken,
    removeGpUnsupportedToken,
  })

  return useCallback(
    async (params: QuoteParamsForFetching) => {
      const { quoteParams, isPriceRefresh } = params
      // set the validTo time here
      quoteParams.validTo = calculateValidTo(deadline)

      let quoteData: FeeQuoteParams | QuoteInformationObject = quoteParams

      // price can be null if fee > price
      const handleResponse = (response: CancelableResult<QuoteResult>, isBestQuote: boolean) => {
        const { cancelled, data } = response

        if (cancelled) {
          // Cancellation can happen if a new request is made, then any ongoing query is canceled
          console.debug('[useRefetchPriceCallback] Canceled get quote price for', params)
          return
        }

        const [price, fee] = data as QuoteResult

        quoteData = {
          ...quoteParams,
          fee: getPromiseFulfilledValue(fee, undefined),
          price: getPromiseFulfilledValue(price, undefined),
        }
        // check the promise fulfilled values
        // handle if rejected
        if (!isPromiseFulfilled(fee)) {
          // fee error takes precedence
          throw fee.reason
        } else if (!isPromiseFulfilled(price)) {
          throw price.reason
        }

        // we need to check if returned price is 0 - this is rare but can occur e.g DAI <> WBTC where price diff is huge
        // TODO: check if this should be handled differently by backend - maybe we return a new error like "ZERO_PRICE"
        if (price.value.amount === '0')
          throw new GpQuoteError({
            errorType: GpQuoteErrorCodes.ZeroPrice,
            description: GpQuoteErrorDetails.ZeroPrice,
          })

        const previouslyUnsupportedToken = isUnsupportedTokenGp(sellToken) || isUnsupportedTokenGp(buyToken)
        // can be a previously unsupported token which is now valid
        // so we check against map and remove it
        if (previouslyUnsupportedToken) {
          console.debug('[useRefetchPriceCallback]::Previously unsupported token now supported - re-enabling.')

          removeGpUnsupportedToken({
            chainId,
            address: previouslyUnsupportedToken.address.toLowerCase(),
          })
        }

        // Update quote
        updateQuote({ ...quoteData, isBestQuote })
      }

      const handleError = (error: Error) => {
        // handle any errors in quote fetch
        // we re-use the quoteData object in scope to save values into state
        const quoteError = handleQuoteError({
          error,
          quoteData,
          addUnsupportedToken,
        })

        // Set quote error
        setQuoteError({
          ...quoteData,
          error: quoteError,
        })
      }

      const { sellToken, buyToken, chainId } = quoteData
      // Start action: Either new quote or refreshing quote
      if (isPriceRefresh) {
        // Refresh the quote
        refreshQuote({ sellToken, chainId })
      } else {
        // Get new quote
        getNewQuote(quoteParams)
      }

      // Init get quote methods params
      const bestQuoteParams = { ...params, strategy: priceStrategy }
      const fastQuoteParams = { quoteParams: { ...quoteParams, priceQuality: 'fast' } }

      // Register get best and fast quote methods on window
      registerOnWindow({
        getBestQuote: async () => getBestQuoteResolveOnlyLastCall(bestQuoteParams),
        getFastQuote: async () => getFastQuoteResolveOnlyLastCall(fastQuoteParams),
      })

      // Get the fast quote
      if (!isPriceRefresh) {
        getFastQuoteResolveOnlyLastCall(fastQuoteParams)
          .then((res) => handleResponse(res, false))
          .catch(handleError)
      }

      // Get the best quote
      getBestQuoteResolveOnlyLastCall(bestQuoteParams)
        .then((res) => handleResponse(res, true))
        .catch(handleError)
    },
    [
      deadline,
      priceStrategy,
      isUnsupportedTokenGp,
      updateQuote,
      refreshQuote,
      getNewQuote,
      removeGpUnsupportedToken,
      addUnsupportedToken,
      setQuoteError,
    ]
  )
}
