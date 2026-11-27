import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { FractionUtils, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

export interface GetIsBalanceEnoughParams {
  inputAmount: Nullish<CurrencyAmount<Currency>>
  maximumSellAmount: Nullish<CurrencyAmount<Currency>>
  balance: Nullish<CurrencyAmount<Currency>>
}

export interface GetSwapConfirmDisabledStateParams {
  isTradeContextReady: boolean
  shouldDisplayBridgeDetails: boolean
  hasBridgeQuoteAmounts: boolean
  hasCurrentCurrency: boolean
  isBalanceEnough: boolean | null
  isQuoteLoading: boolean
  quoteCounter: number
  isQuoteStale: boolean
}

export interface SwapConfirmDisabledState {
  disableConfirm: boolean
  isInsufficientBalance: boolean
}

export function getIsBalanceEnough({
  inputAmount,
  maximumSellAmount,
  balance,
}: GetIsBalanceEnoughParams): boolean | null {
  const sellCurrency = inputAmount?.currency
  const amountToCover = maximumSellAmount ?? inputAmount

  if (!sellCurrency || !amountToCover || !balance) return null
  if (!isQuotedInSameAsset(sellCurrency, amountToCover.currency)) return null

  return FractionUtils.lte(
    FractionUtils.fractionLikeToFraction(amountToCover),
    FractionUtils.fractionLikeToFraction(balance),
  )
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

  if (isBalanceEnough === null) {
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

function isQuotedInSameAsset(sellCurrency: Currency, quotedCurrency: Currency): boolean {
  if (sellCurrency.equals(quotedCurrency)) return true

  const wrapped = WRAPPED_NATIVE_CURRENCIES[sellCurrency.chainId as SupportedChainId]

  return Boolean(wrapped) && getIsNativeToken(sellCurrency) && quotedCurrency.equals(wrapped)
}
