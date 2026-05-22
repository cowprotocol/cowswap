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
