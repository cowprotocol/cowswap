import { useEffect, useMemo } from 'react'

import { DEFAULT_DECIMALS } from '@cowprotocol/common-const'
import { useDebounce, useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getIsNativeToken, isAddress, isSellOrder, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind, PriceQuality } from '@cowprotocol/cow-sdk'
import { useENSAddress } from '@cowprotocol/ens'
import { useIsUnsupportedToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useRefetchQuoteCallback } from 'legacy/hooks/useRefetchPriceCallback'
import { useAllQuotes, useIsBestQuoteLoading, useSetQuoteError } from 'legacy/state/price/hooks'
import { isWrappingTrade } from 'legacy/state/swap/utils'
import { Field } from 'legacy/state/types'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useAppData } from 'modules/appData'
import { useDerivedSwapInfo, useSwapState } from 'modules/swap/hooks/useSwapState'
import { useIsEoaEthFlow } from 'modules/trade'

import { isRefetchQuoteRequired } from './isRefetchQuoteRequired'
import { quoteUsingSameParameters } from './quoteUsingSameParameters'

export const TYPED_VALUE_DEBOUNCE_TIME = 350
export const SWAP_QUOTE_CHECK_INTERVAL = ms`30s` // Every 30s

export function FeesUpdater(): null {
  const { chainId, account } = useWalletInfo()

  const { independentField, typedValue: rawTypedValue, recipient } = useSwapState()
  const {
    currencies: { INPUT: sellCurrency, OUTPUT: buyCurrency },
    currenciesIds: { INPUT: sellCurrencyId, OUTPUT: buyCurrencyId },
  } = useDerivedSwapInfo()

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const receiver = ensRecipientAddress || recipient

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, TYPED_VALUE_DEBOUNCE_TIME)

  const quotesMap = useAllQuotes(chainId)

  const quoteInfo = useMemo(() => {
    return quotesMap && sellCurrencyId ? quotesMap[sellCurrencyId] : undefined
  }, [quotesMap, sellCurrencyId])

  const isLoading = useIsBestQuoteLoading()
  const isEthFlow = useIsEoaEthFlow()

  const isUnsupportedToken = useIsUnsupportedToken()

  const appData = useAppData()

  const refetchQuote = useRefetchQuoteCallback()
  const setQuoteError = useSetQuoteError()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const [deadline] = useUserTransactionTTL()

  // prevents things like "USDC" being used as an address
  const sellTokenAddressInvalid = sellCurrency && !getIsNativeToken(sellCurrency) && !isAddress(sellCurrencyId)
  const buyTokenAddressInvalid = buyCurrency && !getIsNativeToken(buyCurrency) && !isAddress(buyCurrencyId)

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if:
    //  - window is not visible
    //  - some parameter is missing
    //  - it is a wrapping operation
    if (
      !chainId ||
      !sellCurrencyId ||
      !buyCurrencyId ||
      !typedValue ||
      !isWindowVisible ||
      sellTokenAddressInvalid ||
      buyTokenAddressInvalid
    )
      return

    // Native wrap trade, return
    if (isWrappingTrade(sellCurrency, buyCurrency, chainId)) return

    // Quotes api fails when receiver is not address
    if (receiver && !isAddress(receiver)) return

    // Don't refetch if the amount is missing
    const kind = independentField === Field.INPUT ? OrderKind.SELL : OrderKind.BUY
    const amount = tryParseCurrencyAmount(typedValue, (isSellOrder(kind) ? sellCurrency : buyCurrency) ?? undefined)
    if (!amount) return

    const fromDecimals = sellCurrency?.decimals ?? DEFAULT_DECIMALS
    const toDecimals = buyCurrency?.decimals ?? DEFAULT_DECIMALS

    const quoteParams = {
      chainId,
      sellToken: sellCurrencyId,
      buyToken: buyCurrencyId,
      fromDecimals,
      toDecimals,
      kind,
      amount: amount.quotient.toString(),
      receiver,
      userAddress: account,
      validFor: deadline,
      isEthFlow,
      priceQuality: PriceQuality.OPTIMAL,
      appData: appData?.fullAppData,
      appDataHash: appData?.appDataKeccak256,
    }

    // Don't refetch if offline.
    //  Also, make sure we update the error state
    if (!isOnline) {
      if (quoteInfo?.error !== 'offline-browser') {
        setQuoteError({ ...quoteParams, error: 'offline-browser' })
      }
      return
    } else {
      // If we are online, we make sure we reset the offline-error
      if (quoteInfo?.error === 'offline-browser') {
        setQuoteError({ ...quoteParams, error: undefined })
      }
    }

    const unsupportedToken = isUnsupportedToken(sellCurrencyId) || isUnsupportedToken(buyCurrencyId)

    // Callback to re-fetch both the fee and the price
    const refetchQuoteIfRequired = () => {
      // if no token is unsupported and needs refetching
      const hasToRefetch = !unsupportedToken && isRefetchQuoteRequired(isLoading, quoteParams, quoteInfo) //

      if (hasToRefetch) {
        // Decide if this is a new quote, or just a refresh
        const thereIsPreviousPrice = !!quoteInfo?.price?.amount
        const isPriceRefresh = quoteInfo
          ? thereIsPreviousPrice && quoteUsingSameParameters(quoteParams, quoteInfo)
          : false

        refetchQuote({
          quoteParams,
          fetchFee: true, // TODO: Review this, because probably now doesn't make any sense to not query the feee in some situations. Actually the endpoint will change to one that returns fee and quote together
          previousResponse: quoteInfo?.response,
          isPriceRefresh,
        }).catch((error) => console.error('Error re-fetching the quote', error))
      }
    }

    // Refetch fee and price if any parameter changes
    refetchQuoteIfRequired()

    // Periodically re-fetch the fee/price, even if the user don't change the parameters
    // Note that refetchFee won't refresh if it doesn't need to (i.e. the quote is valid for a long time)
    const intervalId = setInterval(() => {
      refetchQuoteIfRequired()
    }, SWAP_QUOTE_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [
    isEthFlow,
    isWindowVisible,
    isOnline,
    chainId,
    sellCurrencyId,
    buyCurrencyId,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency,
    quoteInfo,
    refetchQuote,
    isUnsupportedToken,
    isLoading,
    setQuoteError,
    account,
    receiver,
    deadline,
    buyTokenAddressInvalid,
    sellTokenAddressInvalid,
    appData?.fullAppData,
    appData?.appDataKeccak256,
  ])

  return null
}
