import { useEffect, useMemo, useRef, useState } from 'react'

import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

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
import { useVerifiedQuotesEnabled } from 'common/hooks/featureFlags/useVerifiedQuotesEnabled'
import { useSafeEffect } from 'common/hooks/useSafeMemo'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

import { useAllQuotes, useIsBestQuoteLoading, useSetQuoteError } from './hooks'
import { QuoteInformationObject } from './reducer'

export const TYPED_VALUE_DEBOUNCE_TIME = 350
const REFETCH_CHECK_INTERVAL = 30000 // Every 30s
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
function quoteUsingSameParameters(
  currentParams: FeeQuoteParams,
  quoteInfo?: QuoteInformationObject
): {
  fastQuoteSameParams: boolean
  bestQuoteSameParams: boolean
} {
  if (!quoteInfo) {
    return { fastQuoteSameParams: false, bestQuoteSameParams: false }
  }

  const {
    amount: currentAmount,
    sellToken: currentSellToken,
    buyToken: currentBuyToken,
    kind: currentKind,
    priceQuality: currentPriceQuality,
    userAddress: currentUserAddress,
    receiver: currentReceiver,
  } = currentParams
  const { amount, buyToken, sellToken, kind, userAddress, receiver, priceQuality } = quoteInfo
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

  const sameParams = userAddress ? currentUserAddress === userAddress && paramsWithoutAddress : paramsWithoutAddress

  return {
    fastQuoteSameParams: sameParams,
    bestQuoteSameParams: sameParams && priceQuality === currentPriceQuality,
  }
}

const FETCH_QUOTES = { fetchBestQuote: true, fetchFastQuote: true }
const DONT_FETCH_QUOTES = { fetchBestQuote: false, fetchFastQuote: false }
const FETCH_BEST_QUOTE = { fetchBestQuote: true, fetchFastQuote: false }
/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
function isRefetchQuoteRequired(
  isLoading: boolean,
  bestQuoteSameParams: boolean,
  fastQuoteSameParams: boolean,
  quoteInformation?: QuoteInformationObject
): {
  fetchBestQuote: boolean
  fetchFastQuote: boolean
} {
  // If there's no quote/fee information, we always re-fetch
  if (!quoteInformation) {
    return FETCH_QUOTES
  }

  if (!bestQuoteSameParams || !fastQuoteSameParams) {
    // If the quote params are different, we always re-fetch
    const thereIsPreviousPrice = !!quoteInformation?.price?.amount

    return {
      fetchBestQuote: !bestQuoteSameParams,
      fetchFastQuote: !thereIsPreviousPrice || !fastQuoteSameParams,
    }
  }

  // The query params are the same, so we only ask for a new quote if:
  //  - If the quote was not queried recently
  //  - There's not another price query going on right now
  //  - The quote will expire soon
  if (wasQuoteCheckedRecently(quoteInformation.lastCheck)) {
    // Don't Re-fetch if it was queried recently
    return DONT_FETCH_QUOTES
  } else if (isLoading) {
    // Don't Re-fetch if there's another quote going on with the same params
    // It's better to wait for the timeout or resolution. Also prevents an issue of refreshing too fast with slow APIs
    return DONT_FETCH_QUOTES
  } else if (quoteInformation.fee) {
    // Re-fetch if the fee is expiring soon
    const expiringSoon = isExpiringSoon(quoteInformation.fee.expirationDate, RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME)
    return expiringSoon ? FETCH_BEST_QUOTE : DONT_FETCH_QUOTES
  }

  return DONT_FETCH_QUOTES
}

export default function FeesUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const refetchQuote = useRef(useRefetchQuoteCallback())
  const setQuoteError = useSetQuoteError()
  const isLoading = useIsBestQuoteLoading()
  const isOnline = useIsOnline()
  const quotesMap = useAllQuotes({ chainId })
  const {
    currencies: { INPUT: sellCurrency, OUTPUT: buyCurrency },
    currenciesIds: { INPUT: sellCurrencyId, OUTPUT: buyCurrencyId },
    parsedAmount,
  } = useDerivedSwapInfo()
  const quoteInfo = useMemo(() => {
    return quotesMap && sellCurrencyId ? quotesMap[sellCurrencyId] : undefined
  }, [quotesMap, sellCurrencyId])

  const quoteParams = useQuoteParams({
    chainId,
    account,
    sellCurrency,
    buyCurrency,
    sellCurrencyId,
    buyCurrencyId,
    parsedAmount,
  })
  const lastQuoteParams = useRef(quoteParams)

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if:
    //  - window is not visible
    //  - some parameter is missing
    //  - it is a wrapping operation
    if (!quoteParams) return

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

    // Callback to re-fetch both the fee and the price
    const refetchQuoteIfRequired = () => {
      if (sameQuoteParams(lastQuoteParams.current, quoteParams)) {
        return
      }

      lastQuoteParams.current = quoteParams
      // if no token is unsupported and needs refetching
      const { bestQuoteSameParams, fastQuoteSameParams } = quoteUsingSameParameters(quoteParams, quoteInfo)
      const { fetchBestQuote, fetchFastQuote } = isRefetchQuoteRequired(
        isLoading,
        bestQuoteSameParams,
        fastQuoteSameParams,
        quoteInfo
      )

      if (fetchBestQuote || fetchFastQuote) {
        const isPriceRefresh = !fetchFastQuote

        refetchQuote
          .current({
            quoteParams,
            fetchFee: true, // TODO: Review this, because probably now doesn't make any sense to not query the fee in some situations. Actually the endpoint will change to one that returns fee and quote together
            previousFee: quoteInfo?.fee,
            isPriceRefresh,
          })
          .catch((error) => console.error('Error re-fetching the quote', error))
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
  }, [quoteParams, quoteInfo, isLoading, setQuoteError, isOnline])

  return null
}

function useQuoteParams(params: {
  chainId: SupportedChainId
  account: string | undefined
  sellCurrency: Currency | null | undefined
  buyCurrency: Currency | null | undefined
  sellCurrencyId: string | null | undefined
  buyCurrencyId: string | null | undefined
  parsedAmount: CurrencyAmount<Currency> | undefined
}) {
  const { chainId, account, parsedAmount, sellCurrency, buyCurrency, sellCurrencyId, buyCurrencyId } = params

  const [quoteParams, setQuoteParams] = useState<FeeQuoteParams | undefined>()

  const verifiedQuotesEnabled = useVerifiedQuotesEnabled(chainId)
  const isEthFlow = useIsEoaEthFlow()
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()

  const { independentField, typedValue: rawTypedValue, recipient } = useSwapState()

  const enoughBalance = useEnoughBalanceAndAllowance({
    account,
    amount: parsedAmount,
    spender: undefined, // Not required for verifiedQuotes
  })
  // console.log('[FeesUpdater] enoughBalance veri', { enoughBalance, account, parsedAmount })

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const receiver = ensRecipientAddress || recipient

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, TYPED_VALUE_DEBOUNCE_TIME)

  const isWindowVisible = useIsWindowVisible()
  const { validTo } = useOrderValidTo()

  // prevents things like "USDC" being used as an address
  const sellTokenAddressInvalid = sellCurrency && !sellCurrency.isNative && !isAddress(sellCurrencyId)
  const buyTokenAddressInvalid = buyCurrency && !buyCurrency.isNative && !isAddress(buyCurrencyId)

  // Update if any parameter is changing
  useSafeEffect(() => {
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

    const unsupportedToken =
      Boolean(isUnsupportedTokenGp(sellCurrencyId)) || Boolean(isUnsupportedTokenGp(buyCurrencyId))
    if (unsupportedToken) {
      return
    }

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
      priceQuality: getPriceQuality({
        verifyQuote: verifiedQuotesEnabled && enoughBalance,
      }),
    }

    setQuoteParams(quoteParams)
  }, [
    isEthFlow,
    isWindowVisible,
    chainId,
    sellCurrencyId,
    buyCurrencyId,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency,
    isUnsupportedTokenGp,
    account,
    receiver,
    validTo,
    buyTokenAddressInvalid,
    sellTokenAddressInvalid,
    enoughBalance,
    verifiedQuotesEnabled,
  ])

  return quoteParams
}

function sameQuoteParams(quoteParams1?: FeeQuoteParams, quoteParams2?: FeeQuoteParams) {
  if (quoteParams1 === undefined) {
    return quoteParams2 === undefined
  }
  if (quoteParams2 === undefined) {
    return false
  }

  return (
    quoteParams1.amount === quoteParams2.amount &&
    quoteParams1.buyToken === quoteParams2.buyToken &&
    quoteParams1.chainId === quoteParams2.chainId &&
    quoteParams1.fromDecimals === quoteParams2.fromDecimals &&
    quoteParams1.isBestQuote === quoteParams2.isBestQuote &&
    quoteParams1.isEthFlow === quoteParams2.isEthFlow &&
    quoteParams1.kind === quoteParams2.kind &&
    quoteParams1.priceQuality === quoteParams2.priceQuality &&
    quoteParams1.receiver === quoteParams2.receiver &&
    quoteParams1.sellToken === quoteParams2.sellToken &&
    quoteParams1.toDecimals === quoteParams2.toDecimals &&
    quoteParams1.userAddress === quoteParams2.userAddress
  )
}
