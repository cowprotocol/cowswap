import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

export interface GetIsBalanceEnoughParams {
  sellCurrency: Nullish<Currency>
  maximumSellAmount: Nullish<CurrencyAmount<Currency>>
  balances: Record<string, bigint | undefined>
}

export interface GetSwapConfirmDisabledStateParams {
  isTradeContextReady: boolean
  shouldDisplayBridgeDetails: boolean
  hasBridgeQuoteAmounts: boolean
  hasCurrentCurrency: boolean
  isBalanceEnough: boolean
  isQuoteLoading: boolean
  quoteCounter: number
  isQuoteStale: boolean
}

export interface SwapConfirmDisabledState {
  disableConfirm: boolean
  isInsufficientBalance: boolean
}

/**
 * The balance bucket to read is decided by the currency the user actually spends, while the amount
 * to cover is the slippage-inclusive maximum sell amount.
 *
 * These are not the same currency for a native sell: the quote is denominated in the wrapped token,
 * so taking the currency off the maximum sell amount reads the wrapped balance instead of the native one.
 */
export function getIsBalanceEnough({ sellCurrency, maximumSellAmount, balances }: GetIsBalanceEnoughParams): boolean {
  if (!sellCurrency || !maximumSellAmount) return false

  const balance = balances[getAddressKey(getCurrencyAddress(sellCurrency))]
  const balanceAsCurrencyAmount = CurrencyAmount.fromRawAmount(sellCurrency, balance?.toString() ?? '0')

  return maximumSellAmount.equalTo(balanceAsCurrencyAmount) || maximumSellAmount.lessThan(balanceAsCurrencyAmount)
}

export function getSwapConfirmDisabledState(params: GetSwapConfirmDisabledStateParams): SwapConfirmDisabledState {
  const {
    isTradeContextReady,
    shouldDisplayBridgeDetails,
    hasBridgeQuoteAmounts,
    hasCurrentCurrency,
    isBalanceEnough,
    isQuoteLoading,
    quoteCounter,
    isQuoteStale,
  } = params

  const isQuoteRefreshing = isQuoteLoading || quoteCounter === 0 || isQuoteStale

  if (isQuoteRefreshing) {
    return {
      disableConfirm: true,
      isInsufficientBalance: false,
    }
  }

  if (!isTradeContextReady) {
    return {
      disableConfirm: true,
      isInsufficientBalance: false,
    }
  }

  if (shouldDisplayBridgeDetails && !hasBridgeQuoteAmounts) {
    return {
      disableConfirm: true,
      isInsufficientBalance: false,
    }
  }

  if (!hasCurrentCurrency) {
    return {
      disableConfirm: true,
      isInsufficientBalance: false,
    }
  }

  return {
    disableConfirm: !isBalanceEnough,
    isInsufficientBalance: !isBalanceEnough,
  }
}
