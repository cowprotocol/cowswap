import { useEffect } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Field } from 'state/swap/actions'
import { useCurrency } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useAllQuotes } from './hooks'
import { useRefetchQuoteCallback } from 'hooks/useRefetchPriceCallback'
import { FeeQuoteParams } from 'utils/operator'
import { QuoteInformationObject } from './reducer'

const DEBOUNCE_TIME = 350
const REFETCH_CHECK_INTERVAL = 10000 // Every 10s
const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = 30000 // Will renew the quote if there's less than 30 seconds left for the quote to expire
const WAITING_TIME_BETWEEN_EQUAL_REQUESTS = 5000 // Prevents from sending the same request to often (max, every 5s)
const PRICE_UPDATE_TIME = 10000 // If the price is older than 10s, refresh

/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function wasCheckedRecently(lastQuoteCheck: number): boolean {
  return lastQuoteCheck + WAITING_TIME_BETWEEN_EQUAL_REQUESTS > Date.now()
}

/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function priceIsOld(quoteInfo?: QuoteInformationObject): boolean {
  const lastPriceCheck = quoteInfo?.lastCheck
  if (!lastPriceCheck) {
    return true
  }
  const isPriceOld = lastPriceCheck + PRICE_UPDATE_TIME < Date.now()
  // console.log(`[state:price:updater] Price is old? `, isPriceOld)
  return isPriceOld
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
  const { amount: currentAmount, sellToken: currentSellToken, buyToken: currentBuyToken } = currentParams
  const { amount, buyToken, sellToken } = quoteInfo

  return sellToken === currentSellToken && buyToken === currentBuyToken && amount === currentAmount
}

/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
function isRefetchQuoteRequired(currentParams: FeeQuoteParams, quoteInformation?: QuoteInformationObject): boolean {
  if (!quoteInformation || !quoteInformation.fee) {
    // If there's no quote/fee information, we always re-fetch
    return true
  }

  if (!quoteUsingSameParameters(currentParams, quoteInformation)) {
    // If the current parameters don't match the fee, the fee information is invalid and needs to be re-fetched
    return true
  }

  // The query params are the same, so we only ask for a new quote if:
  //  - If the quote was not queried recently
  //  - The quote will expire soon

  if (wasCheckedRecently(quoteInformation.lastCheck)) {
    // Don't Re-fetch if it was queried recently
    return false
  } else {
    // Re-fetch if the fee is expiring soon
    return isFeeExpiringSoon(quoteInformation.fee.expirationDate)
  }
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
    typedValue: rawTypedValue
  } = useSwapState()

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, DEBOUNCE_TIME)

  const sellCurrency = useCurrency(sellToken)
  const buyCurrency = useCurrency(buyToken)
  const quotesMap = useAllQuotes({ chainId })
  const quoteInfo = quotesMap && sellToken ? quotesMap[sellToken] : undefined

  const refetchQuote = useRefetchQuoteCallback()
  const windowVisible = useIsWindowVisible()

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if window is not visible, or some parameter is missing
    if (!chainId || !sellToken || !buyToken || !typedValue || !windowVisible) return

    const kind = independentField === Field.INPUT ? 'sell' : 'buy'
    const amount = tryParseAmount(typedValue, (kind === 'sell' ? sellCurrency : buyCurrency) ?? undefined)

    // Don't refetch if the amount is missing
    if (!amount) return

    // Callback to re-fetch both the fee and the price
    const refetchQuoteIfRequired = () => {
      const quoteParams = { buyToken, chainId, sellToken, kind, amount: amount.raw.toString() }

      const refetchAll = isRefetchQuoteRequired(quoteParams, quoteInfo)
      const refetchPrice = priceIsOld(quoteInfo)
      if (refetchAll || refetchPrice) {
        refetchQuote({
          quoteParams,
          fetchFee: refetchAll,
          previousFee: quoteInfo?.fee
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
    chainId,
    sellToken,
    buyToken,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency,
    quoteInfo,
    refetchQuote
  ])

  return null
}
