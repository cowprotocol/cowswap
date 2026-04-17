export interface GetSwapConfirmDisabledStateParams {
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

export function getSwapConfirmDisabledState(params: GetSwapConfirmDisabledStateParams): SwapConfirmDisabledState {
  const {
    shouldDisplayBridgeDetails,
    hasBridgeQuoteAmounts,
    hasCurrentCurrency,
    isBalanceEnough,
    isQuoteLoading,
    quoteCounter,
    isQuoteStale,
  } = params

  const isBridgeQuoteRefreshing = shouldDisplayBridgeDetails && (isQuoteLoading || quoteCounter === 0 || isQuoteStale)

  if (isBridgeQuoteRefreshing) {
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
