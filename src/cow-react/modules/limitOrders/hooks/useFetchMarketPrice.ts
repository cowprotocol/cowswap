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
import { getAddress } from '../utils/getAddress'
import useENSAddress from 'hooks/useENSAddress'
import { getQuote } from '@cow/api/gnosisProtocol'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { useUserTransactionTTL } from 'state/user/hooks'
import { calculateValidTo } from 'hooks/useSwapCallback'
import { Fraction } from '@uniswap/sdk-core'

const REFETCH_CHECK_INTERVAL = 10000 // Every 10s

export function useFetchMarketPrice() {
  const { chainId, account } = useWeb3React()

  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  // DAI / WETH

  const { inputCurrency: sellCurrency, outputCurrency: buyCurrency, orderKind, recipient } = useLimitOrdersTradeState()
  const { exactTypedValue } = useTypedValue()
  const { validTo } = useOrderValidTo()

  const [deadline] = useUserTransactionTTL()

  // Receiver address
  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const receiver = ensRecipientAddress || recipient

  // Handle response
  const handleResponse = useCallback(
    (response: SimpleGetQuoteResponse) => {
      const { buyAmount, sellAmount } = response.quote

      const executionRate = new Fraction(sellAmount, buyAmount)

      // Calculate the new execution rate

      console.log('debug new execution price', executionRate.toFixed(16))

      // // Update the rate state
      updateLimitRateState({ executionRate })
    },
    [updateLimitRateState]
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

    const sellToken = getAddress(sellCurrency)
    const buyToken = getAddress(buyCurrency)

    if (!amount || !sellToken || !buyToken) return

    const quoteParams = {
      validTo: calculateValidTo(deadline),
      amount: amount.quotient.toString(),
      kind: orderKind,
      sellToken,
      buyToken,
      fromDecimals,
      toDecimals,
      chainId,
    }

    // Fetch the quote and handle the response
    const handleFetchQuote = () => {
      getQuote(quoteParams).then(handleResponse).catch(handleError)
    }

    handleFetchQuote()

    // Run the interval
    const intervalId = setInterval(handleFetchQuote, REFETCH_CHECK_INTERVAL)

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
    deadline,
  ])
}
