import { useEffect, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { OrderKind } from '@cowprotocol/contracts'
import { useUpdateAtom } from 'jotai/utils'

import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { useTypedValue } from './useTypedValue'
import { useOrderValidTo } from 'state/user/hooks'
import { DEFAULT_DECIMALS } from 'custom/constants'
import { getCurrencyAddress } from '../utils/getCurrencyAddress'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import useENSAddress from 'hooks/useENSAddress'
import { getBestQuote, QuoteResult } from 'utils/price'
import { CancelableResult, onlyResolvesLast } from 'utils/async'
import { getPromiseFulfilledValue } from 'utils/misc'

const REFETCH_CHECK_INTERVAL = 10000 // Every 10s

const getBestQuoteResolveOnlyLastCall = onlyResolvesLast<QuoteResult>(getBestQuote)

export function useFetchMarketPrice() {
  const { chainId, account } = useWeb3React()

  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const { inputCurrency: sellCurrency, outputCurrency: buyCurrency, orderKind, recipient } = useLimitOrdersTradeState()
  const { exactTypedValue } = useTypedValue()
  const { validTo } = useOrderValidTo()

  // Receiver address
  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const receiver = ensRecipientAddress || recipient

  // Handle response
  const handleResponse = useCallback(
    (response: CancelableResult<QuoteResult>, params: any) => {
      const { cancelled, data } = response

      if (cancelled) {
        // Cancellation can happen if a new request is made, then any ongoing query is canceled
        console.debug('[useFetchMarketPrice] Canceled get quote price for', params)
        return
      }

      const [price, fee] = data as QuoteResult

      const quote = {
        fee: getPromiseFulfilledValue(fee, undefined),
        price: getPromiseFulfilledValue(price, undefined),
      }

      if (!quote.price) return

      // TODO: what should we do with the fee here?
      // TODO: is this idea to divide quote price and typed amount correct?
      // TODO: update the math operation types
      // Calculate the execution: quote price / typed amount
      const executionRate = Number(quote.price.amount) / Number(exactTypedValue)

      // Set the market rate
      updateLimitRateState({ executionRate: String(executionRate) })
    },
    [exactTypedValue, updateLimitRateState]
  )

  // Handle error
  const handleError = useCallback((err) => {
    console.debug('[useFetchMarketPrice] Failed to fetch exection price', err)
  }, [])

  useEffect(() => {
    if (!sellCurrency || !buyCurrency || !exactTypedValue || !chainId) {
      return
    }

    // Prepare quote params
    const fromDecimals = sellCurrency?.decimals ?? DEFAULT_DECIMALS
    const toDecimals = buyCurrency?.decimals ?? DEFAULT_DECIMALS

    const amount = tryParseCurrencyAmount(
      exactTypedValue,
      (orderKind === OrderKind.SELL ? sellCurrency : buyCurrency) ?? undefined
    )
    if (!amount) return

    const quoteParams = {
      sellToken: getCurrencyAddress(sellCurrency as WrappedTokenInfo),
      buyToken: getCurrencyAddress(buyCurrency as WrappedTokenInfo),
      amount: amount.quotient.toString(),
      kind: orderKind,
      fromDecimals,
      toDecimals,
      chainId,
    }

    // Fetch the quote and handle the response
    const getQuote = () => {
      getBestQuoteResolveOnlyLastCall({ quoteParams, fetchFee: true })
        .then((res) => handleResponse(res, quoteParams))
        .catch(handleError)
    }

    getQuote()

    // Run the interval
    const intervalId = setInterval(getQuote, REFETCH_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [
    chainId,
    exactTypedValue,
    sellCurrency,
    buyCurrency,
    orderKind,
    account,
    validTo,
    receiver,
    handleResponse,
    handleError,
  ])
}
