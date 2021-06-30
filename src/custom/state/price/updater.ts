import { useEffect } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Field } from 'state/swap/actions'
import { useCurrency } from 'hooks/Tokens'
import { useAllQuotes, useIsQuoteLoading, useSetQuoteError } from './hooks'
import { useRefetchQuoteCallback } from 'hooks/useRefetchPriceCallback'
import { FeeQuoteParams, UnsupportedToken } from 'utils/operator'
import { QuoteInformationObject } from './reducer'
import { useIsUnsupportedTokenGp } from 'state/lists/hooks/hooksMod'
import useDebounceWithForceUpdate from 'hooks/useDebounceWithForceUpdate'
import useIsOnline from 'hooks/useIsOnline'
import { DEFAULT_DECIMALS } from 'custom/constants'

const DEBOUNCE_TIME = 350
const REFETCH_CHECK_INTERVAL = 10000 // Every 10s
const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = 30000 // Will renew the quote if there's less than 30 seconds left for the quote to expire
const WAITING_TIME_BETWEEN_EQUAL_REQUESTS = 5000 // Prevents from sending the same request to often (max, every 5s)
const UNSUPPORTED_TOKEN_REFETCH_CHECK_INTERVAL = 10 * 60 * 1000 // if unsupported token was added > 10min ago, re-try

/**
 * Returns if the quote has been recently checked
 */
function wasQuoteCheckedRecently(lastQuoteCheck: number): boolean {
  return lastQuoteCheck + WAITING_TIME_BETWEEN_EQUAL_REQUESTS > Date.now()
}
/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function isFeeExpiringSoon(quoteExpirationIsoDate: string): boolean {
  const feeExpirationDate = Date.parse(quoteExpirationIsoDate)
  const needRefetch = feeExpirationDate <= Date.now() + RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME

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
    kind: currentKind
  } = currentParams
  const { amount, buyToken, sellToken, kind } = quoteInfo

  return (
    sellToken === currentSellToken && buyToken === currentBuyToken && amount === currentAmount && kind === currentKind
  )
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
    return isFeeExpiringSoon(quoteInformation.fee.expirationDate)
  }

  return false
}

function unsupportedTokenNeedsRecheck(unsupportedToken: UnsupportedToken[string] | false) {
  if (!unsupportedToken) return false

  return Date.now() - unsupportedToken.dateAdded > UNSUPPORTED_TOKEN_REFETCH_CHECK_INTERVAL
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
    typedValue: rawTypedValue
  } = useSwapState()

  // pass independent field as a reference to use against
  // any changes to determine if user has switched input fields
  // useful to force debounce value to refresh
  const forceUpdateRef = independentField

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounceWithForceUpdate(rawTypedValue, DEBOUNCE_TIME, forceUpdateRef)

  const sellCurrency = useCurrency(sellToken)
  const buyCurrency = useCurrency(buyToken)
  const quotesMap = useAllQuotes({ chainId })
  const quoteInfo = quotesMap && sellToken ? quotesMap[sellToken] : undefined
  const isLoading = useIsQuoteLoading()

  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()

  const refetchQuote = useRefetchQuoteCallback()
  const setQuoteError = useSetQuoteError()

  const windowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if:
    //  - window is not visible
    //  - browser is offline
    //  - some parameter is missing
    if (!chainId || !sellToken || !buyToken || !typedValue || !windowVisible) return

    // Don't refetch if the amount is missing
    const kind = independentField === Field.INPUT ? 'sell' : 'buy'
    const amount = tryParseAmount(typedValue, (kind === 'sell' ? sellCurrency : buyCurrency) ?? undefined)
    if (!amount) return

    const fromDecimals = sellCurrency?.decimals ?? DEFAULT_DECIMALS
    const toDecimals = buyCurrency?.decimals ?? DEFAULT_DECIMALS
    const quoteParams = { chainId, sellToken, buyToken, fromDecimals, toDecimals, kind, amount: amount.raw.toString() }

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

    const unsupportedToken =
      isUnsupportedTokenGp(sellToken.toLowerCase()) || isUnsupportedTokenGp(buyToken.toLowerCase())

    // IS an unsupported token and it's been greater than the threshold time
    const unsupportedNeedsCheck = unsupportedTokenNeedsRecheck(unsupportedToken)

    // Callback to re-fetch both the fee and the price
    const refetchQuoteIfRequired = () => {
      // if no token is unsupported and needs refetching
      const hasToRefetch = !unsupportedToken && isRefetchQuoteRequired(isLoading, quoteParams, quoteInfo)

      if (unsupportedNeedsCheck || hasToRefetch) {
        // Decide if this is a new quote, or just a refresh
        const thereIsPreviousPrice = !!quoteInfo?.price?.amount
        const isPriceRefresh = quoteInfo
          ? thereIsPreviousPrice && quoteUsingSameParameters(quoteParams, quoteInfo)
          : false

        refetchQuote({
          quoteParams,
          fetchFee: true, // TODO: Review this, because probably now doesn't make any sense to not query the feee in some situations. Actually the endpoint will change to one that returns fee and quote together
          previousFee: quoteInfo?.fee,
          isPriceRefresh
        }).catch(error => console.error('Error re-fetching the quote', error))
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
    windowVisible,
    isOnline,
    chainId,
    sellToken,
    buyToken,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency,
    quoteInfo,
    refetchQuote,
    isUnsupportedTokenGp,
    isLoading,
    setQuoteError
  ])

  return null
}
