import { useEffect, useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { OrderKind } from '@cowprotocol/contracts'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import { Fraction } from '@uniswap/sdk-core'

import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { useTypedValue } from './useTypedValue'
import { useOrderValidTo } from 'state/user/hooks'
import { DEFAULT_DECIMALS } from 'custom/constants'
import { getAddress } from '../utils/getAddress'
import useENSAddress from 'hooks/useENSAddress'
import { getQuote } from '@cow/api/gnosisProtocol'
import { useUserTransactionTTL } from 'state/user/hooks'
import { calculateValidTo } from 'hooks/useSwapCallback'
import { LegacyFeeQuoteParams as FeeQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { parseUnits } from '@ethersproject/units'

const REFETCH_CHECK_INTERVAL = 10000 // Every 10s

export function useFetchMarketPrice() {
  const { chainId, account } = useWeb3React()

  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

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

      // Create fraction for execution rate
      const executionRate = new Fraction(sellAmount, buyAmount)

      // Update the rate state
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

    const amount =
      orderKind === OrderKind.SELL
        ? parseUnits(exactTypedValue, sellCurrency.decimals).toString()
        : parseUnits(exactTypedValue, buyCurrency.decimals).toString()

    const sellToken = getAddress(sellCurrency)
    const buyToken = getAddress(buyCurrency)

    if (!amount || !sellToken || !buyToken) return

    const quoteParams: FeeQuoteParams = {
      validTo: calculateValidTo(deadline),
      amount,
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
