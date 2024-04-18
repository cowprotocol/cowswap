import { useCallback } from 'react'

import { isOnline } from '@cowprotocol/common-hooks'
import {
  CancelableResult,
  getPromiseFulfilledValue,
  getQuoteUnsupportedToken,
  isPromiseFulfilled,
  isSellOrder,
  onlyResolvesLast,
} from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useAddUnsupportedToken, useIsUnsupportedToken, useRemoveUnsupportedToken } from '@cowprotocol/tokens'

import { useGetGpPriceStrategy } from 'legacy/hooks/useGetGpPriceStrategy'
import { QuoteError } from 'legacy/state/price/actions'
import { useQuoteDispatchers } from 'legacy/state/price/hooks'
import { QuoteInformationObject } from 'legacy/state/price/reducer'
import { LegacyFeeQuoteParams, LegacyQuoteParams } from 'legacy/state/price/types'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'
import { getBestQuote, getFastQuote, QuoteResult } from 'legacy/utils/price'

import { logSwapParams } from 'modules/swap/helpers/logSwapParams'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'

import { ApiErrorCodes, isValidOperatorError } from 'api/gnosisProtocol/errors/OperatorError'
import GpQuoteError, {
  GpQuoteErrorCodes,
  GpQuoteErrorDetails,
  isValidQuoteError,
} from 'api/gnosisProtocol/errors/QuoteError'

interface HandleQuoteErrorParams {
  quoteData: QuoteInformationObject | LegacyFeeQuoteParams
  error: unknown
  addUnsupportedToken: (tokenAddress: string) => void
}

type QuoteParamsForFetching = Omit<LegacyQuoteParams, 'strategy'>

export function handleQuoteError({ quoteData, error, addUnsupportedToken }: HandleQuoteErrorParams): QuoteError {
  if (isValidOperatorError(error)) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteData)
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        if (unsupportedTokenAddress) {
          addUnsupportedToken(unsupportedTokenAddress)
        }

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
        const unsupportedTokenAddress = getQuoteUnsupportedToken(error, quoteData)
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        if (unsupportedTokenAddress) {
          addUnsupportedToken(unsupportedTokenAddress)
        }

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
  const getIsUnsupportedToken = useIsUnsupportedToken()
  // dispatchers
  const { getNewQuote, refreshQuote, updateQuote, setQuoteError } = useQuoteDispatchers()
  const addUnsupportedToken = useAddUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveUnsupportedToken()
  const strategy = useGetGpPriceStrategy()
  const [deadline] = useUserTransactionTTL()
  const isEoaEthFlow = useIsEoaEthFlow()

  return useCallback(
    async (params: QuoteParamsForFetching) => {
      const { quoteParams, isPriceRefresh } = params
      // set the validTo time here
      quoteParams.validFor = deadline
      quoteParams.isEthFlow = isEoaEthFlow

      let quoteData: LegacyFeeQuoteParams | QuoteInformationObject = quoteParams

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

        const previouslyUnsupportedToken = getIsUnsupportedToken(sellToken)
          ? sellToken
          : getIsUnsupportedToken(buyToken)
          ? buyToken
          : null
        // can be a previously unsupported token which is now valid
        // so we check against map and remove it
        if (previouslyUnsupportedToken) {
          console.debug('[useRefetchPriceCallback]::Previously unsupported token now supported - re-enabling.')

          removeGpUnsupportedToken(previouslyUnsupportedToken)
        }

        logSwapParams('quote', {
          sellAmount: isSellOrder(quoteData.kind) ? quoteData.amount : price.value.amount,
          buyAmount: !isSellOrder(quoteData.kind) ? quoteData.amount : price.value.amount,
          feeAmount: fee.value.amount,
          sellDecimals: quoteData.fromDecimals,
          buyDecimals: quoteData.toDecimals,
        })
        // Update quote
        updateQuote({ ...quoteData, quoteValidTo: price.value.quoteValidTo, isBestQuote })
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

      const bestQuoteParams = {
        ...params,
        strategy,
        quoteParams,
      }
      const fastQuoteParams = {
        quoteParams: {
          ...quoteParams,
          priceQuality: PriceQuality.FAST,
        },
      }

      // Get the fast quote
      if (!isPriceRefresh) {
        getFastQuoteResolveOnlyLastCall(fastQuoteParams)
          .then((res) => handleResponse(res, false))
          .catch(handleError)
      }

      // Get the best quote
      getBestQuoteResolveOnlyLastCall(bestQuoteParams)
        .then((res) => {
          handleResponse(res, true)
        })
        .catch(handleError)
    },
    [
      isEoaEthFlow,
      deadline,
      strategy,
      getIsUnsupportedToken,
      updateQuote,
      refreshQuote,
      getNewQuote,
      removeGpUnsupportedToken,
      addUnsupportedToken,
      setQuoteError,
    ]
  )
}
