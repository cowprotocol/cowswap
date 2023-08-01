import { useEffect, useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { DEFAULT_DECIMALS } from 'legacy/constants'
import useDebounce from 'legacy/hooks/useDebounce'
import useENSAddress from 'legacy/hooks/useENSAddress'
import useIsOnline from 'legacy/hooks/useIsOnline'
import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'
import { useRefetchQuoteCallback } from 'legacy/hooks/useRefetchPriceCallback'
import { useIsUnsupportedTokenGp } from 'legacy/state/lists/hooks'
import { Field } from 'legacy/state/swap/actions'
import { useDerivedSwapInfo, useSwapState } from 'legacy/state/swap/hooks'
import { isWrappingTrade } from 'legacy/state/swap/utils'
import { useOrderValidTo } from 'legacy/state/user/hooks'
import { isAddress } from 'legacy/utils'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { useWalletInfo } from 'modules/wallet'

import { getPriceQuality } from 'api/gnosisProtocol/api'
import { LegacyFeeQuoteParams as LegacyFeeQuoteParamsFull } from 'api/gnosisProtocol/legacy/types'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

import { useAllQuotes, useIsBestQuoteLoading, useSetQuoteError } from './hooks'
import { QuoteInformationObject } from './reducer'

export const TYPED_VALUE_DEBOUNCE_TIME = 350
const REFETCH_CHECK_INTERVAL = 10000 // Every 10s
const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = 30000 // Will renew the quote if there's less than 30 seconds left for the quote to expire
const WAITING_TIME_BETWEEN_EQUAL_REQUESTS = 5000 // Prevents from sending the same request to often (max, every 5s)

type FeeQuoteParams = Omit<LegacyFeeQuoteParamsFull, 'validTo'>

/**
 * Returns if the quote has been recently checked
 */
function wasQuoteCheckedRecently(lastQuoteCheck: number): boolean {
  return lastQuoteCheck + WAITING_TIME_BETWEEN_EQUAL_REQUESTS > Date.now()
}
/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function isExpiringSoon(quoteExpirationIsoDate: string, threshold: number): boolean {
  const feeExpirationDate = Date.parse(quoteExpirationIsoDate)
  const needRefetch = feeExpirationDate <= Date.now() + threshold

  // const secondsLeft = (feeExpirationDate.valueOf() - Date.now()) / 1000
  // console.log(`[state:price:updater] Fee isExpiring in ${secondsLeft}. Refetch?`, needRefetch)

  return needRefetch
}

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
function quoteUsingSameParameters(currentParams: FeeQuoteParams, quoteInfo: QuoteInformationObject): boolean {
  const {
    amount: currentAmount,
    sellToken: currentSellToken,
    buyToken: currentBuyToken,
    kind: currentKind,
    userAddress: currentUserAddress,
    receiver: currentReceiver,
  } = currentParams
  const { amount, buyToken, sellToken, kind, userAddress, receiver } = quoteInfo
  const hasSameReceiver = currentReceiver && receiver ? currentReceiver === receiver : true

  // cache the base quote params without quoteInfo user address to check
  const paramsWithoutAddress =
    sellToken === currentSellToken &&
    buyToken === currentBuyToken &&
    amount === currentAmount &&
    kind === currentKind &&
    hasSameReceiver
  // 2 checks: if there's a quoteInfo user address (meaning quote was already calculated once) and one without
  // in case user is not connected
  return userAddress ? currentUserAddress === userAddress && paramsWithoutAddress : paramsWithoutAddress
}

/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
function isRefetchQuoteRequired(
  isLoading: boolean,
  currentParams: FeeQuoteParams,
  quoteInformation?: QuoteInformationObject
): boolean {
  // If there's no quote/fee information, we always re-fetch
  if (!quoteInformation) {
    return true
  }

  if (!quoteUsingSameParameters(currentParams, quoteInformation)) {
    // If the current parameters don't match the fee, the fee information is invalid and needs to be re-fetched
    return true
  }

  // The query params are the same, so we only ask for a new quote if:
  //  - If the quote was not queried recently
  //  - There's not another price query going on right now
  //  - The quote will expire soon
  if (wasQuoteCheckedRecently(quoteInformation.lastCheck)) {
    // Don't Re-fetch if it was queried recently
    return false
  } else if (isLoading) {
    // Don't Re-fetch if there's another quote going on with the same params
    // It's better to wait for the timeout or resolution. Also prevents an issue of refreshing too fast with slow APIs
    return false
  } else if (quoteInformation.fee) {
    // Re-fetch if the fee is expiring soon
    return isExpiringSoon(quoteInformation.fee.expirationDate, RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME)
  }

  return false
}

export default function FeesUpdater(): null {
  const { chainId, account } = useWalletInfo()

  const { independentField, typedValue: rawTypedValue, recipient } = useSwapState()
  const {
    currencies: { INPUT: sellCurrency, OUTPUT: buyCurrency },
    currenciesIds: { INPUT: sellCurrencyId, OUTPUT: buyCurrencyId },
    parsedAmount,
  } = useDerivedSwapInfo()

  const enoughBalance = useEnoughBalanceAndAllowance({ account, amount: parsedAmount })

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const receiver = ensRecipientAddress || recipient

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, TYPED_VALUE_DEBOUNCE_TIME)

  const quotesMap = useAllQuotes({ chainId })

  const quoteInfo = useMemo(() => {
    return quotesMap && sellCurrencyId ? quotesMap[sellCurrencyId] : undefined
  }, [quotesMap, sellCurrencyId])

  const isLoading = useIsBestQuoteLoading()
  const isEthFlow = useIsEoaEthFlow()

  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()

  const refetchQuote = useRefetchQuoteCallback()
  const setQuoteError = useSetQuoteError()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const { validTo } = useOrderValidTo()

  // prevents things like "USDC" being used as an address
  const sellTokenAddressInvalid = sellCurrency && !sellCurrency.isNative && !isAddress(sellCurrencyId)
  const buyTokenAddressInvalid = buyCurrency && !buyCurrency.isNative && !isAddress(buyCurrencyId)

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
    const amount = tryParseCurrencyAmount(
      typedValue,
      (kind === OrderKind.SELL ? sellCurrency : buyCurrency) ?? undefined
    )
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
      validTo,
      isEthFlow,
      priceQuality: getPriceQuality({ verifyQuote: enoughBalance }),
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

    const unsupportedToken = isUnsupportedTokenGp(sellCurrencyId) || isUnsupportedTokenGp(buyCurrencyId)

    // Callback to re-fetch both the fee and the price
    const refetchQuoteIfRequired = () => {
      // if no token is unsupported and needs refetching
      const hasToRefetch = !unsupportedToken && isRefetchQuoteRequired(isLoading, quoteParams, quoteInfo)

      if (hasToRefetch) {
        // Decide if this is a new quote, or just a refresh
        const thereIsPreviousPrice = !!quoteInfo?.price?.amount
        const isPriceRefresh = quoteInfo
          ? thereIsPreviousPrice && quoteUsingSameParameters(quoteParams, quoteInfo)
          : false

        refetchQuote({
          quoteParams,
          fetchFee: true, // TODO: Review this, because probably now doesn't make any sense to not query the feee in some situations. Actually the endpoint will change to one that returns fee and quote together
          previousFee: quoteInfo?.fee,
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
    }, REFETCH_CHECK_INTERVAL)

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
    isUnsupportedTokenGp,
    isLoading,
    setQuoteError,
    account,
    receiver,
    validTo,
    buyTokenAddressInvalid,
    sellTokenAddressInvalid,
    enoughBalance,
  ])

  return null
}
