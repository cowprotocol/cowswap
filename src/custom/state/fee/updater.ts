import { useEffect } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Field } from 'state/swap/actions'
import { useCurrency } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useAllFees } from './hooks'
import { useRefetchFeeCallback } from 'hooks/useRefetchFee'
import { FeeQuoteParams } from 'utils/operator'
import { FeeInformationObject } from './reducer'

const DEBOUNCE_TIME = 350
const REFETCH_FEE_CHECK_INTERVAL = 15000 // Every 15s
const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = 30000 // Will renew the quote if there's less than 30 seconds left for the quote to expire

/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function isExpiringSoon(quoteExpirationIsoDate: string): boolean {
  const quoteExpirationDate = Date.parse(quoteExpirationIsoDate)
  // const secondsLeft = (quoteExpirationDate.valueOf() - Date.now()) / 1000
  // console.log(
  //   `[state:fee:updater] Fee isExpiring in ${secondsLeft}. Refetch?`,
  //   quoteExpirationDate <= Date.now() + RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME
  // )

  return quoteExpirationDate <= Date.now() + RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME
}

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
function feeMatchesCurrentParameters(currentParams: FeeQuoteParams, feeInfo: FeeInformationObject): boolean {
  const { amount: currentAmount, sellToken: currentSellToken, buyToken: currentBuyToken } = currentParams
  const { amount, buyToken, sellToken } = feeInfo

  return sellToken === currentSellToken && buyToken === currentBuyToken && amount === currentAmount
}

/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
function isRefetchQuoteRequired(currentParams: FeeQuoteParams, feeInfo?: FeeInformationObject): boolean {
  if (feeInfo) {
    // If the current parameters don't match the fee, the fee information is invalid and needs to be re-fetched
    if (!feeMatchesCurrentParameters(currentParams, feeInfo)) {
      return true
    }

    // Re-fetch if the quote is expiring soon
    return isExpiringSoon(feeInfo.fee.expirationDate)
  } else {
    // If there's no fee information, we always re-fetch
    return true
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
  const feesMap = useAllFees({ chainId })
  const quoteInfo = feesMap && sellToken ? feesMap[sellToken] : undefined

  const refetchFee = useRefetchFeeCallback()
  const windowVisible = useIsWindowVisible()

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if window is not visible, or some parameter is missing
    if (!chainId || !sellToken || !buyToken || !typedValue || !windowVisible) return

    const kind = independentField === Field.INPUT ? 'sell' : 'buy'
    const amount = tryParseAmount(typedValue, (kind === 'sell' ? sellCurrency : buyCurrency) ?? undefined)

    // Don't refetch if the amount is missing
    if (!amount) return

    // Callback to re-fetch (when required)
    const refetchFeeIfRequired = () => {
      const quoteParams = { buyToken, chainId, sellToken, kind, amount: amount.raw.toString() }
      if (isRefetchQuoteRequired(quoteParams, quoteInfo)) {
        refetchFee(quoteParams).catch(error => console.error('Error re-fetching the fee', error))
      }
    }

    // Refetch fee if any parameter changes
    refetchFeeIfRequired()

    // Periodically re-fetch the fee, even if the user don't change the parameters
    // Note that refetchFee won't refresh if it doesn't need to (i.e. the quote is valid for a long time)
    const intervalId = setInterval(() => {
      refetchFeeIfRequired()
    }, REFETCH_FEE_CHECK_INTERVAL)

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
    refetchFee
  ])

  return null
}
