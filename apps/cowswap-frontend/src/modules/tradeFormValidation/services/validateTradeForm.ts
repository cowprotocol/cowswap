import { getIsNativeToken, isAddress, isFractionFalsy } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function validateTradeForm(context: TradeFormValidationContext): TradeFormValidation | null {
  const {
    derivedTradeState,
    approvalState,
    isBundlingSupported,
    isWrapUnwrap,
    isSupportedWallet,
    isSafeReadonlyUser,
    isSwapUnsupported,
    recipientEnsAddress,
    tradeQuote,
    account,
    isPermitSupported,
    isInsufficientBalanceOrderAllowed,
    isProviderNetworkUnsupported,
    isOnline,
    amountsToSign,
  } = context

  const { inputCurrency, outputCurrency, inputCurrencyAmount, inputCurrencyBalance, recipient, isQuoteBasedOrder } = derivedTradeState
  const isBalanceGreaterThan1Atom = inputCurrencyBalance
    ? BigInt(inputCurrencyBalance.quotient.toString()) > BigInt(0)
    : false
  const canPlaceOrderWithoutBalance = isBalanceGreaterThan1Atom && isInsufficientBalanceOrderAllowed && !isWrapUnwrap
  
  // For quote-based orders (like buy orders), use the maximum send amount that includes fees and slippage
  // Otherwise, use the input currency amount
  const amountToValidateAgainstBalance = isQuoteBasedOrder && amountsToSign 
    ? amountsToSign.maximumSendSellAmount 
    : inputCurrencyAmount

  const isNativeIn = inputCurrency && getIsNativeToken(inputCurrency) && !isWrapUnwrap

  const approvalRequired =
    !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const inputAmountIsNotSet = !inputCurrencyAmount || isFractionFalsy(inputCurrencyAmount)
  const isFastQuote = tradeQuote.fetchParams?.priceQuality === PriceQuality.FAST

  if (!isWrapUnwrap && tradeQuote.error) {
    return TradeFormValidation.QuoteErrors
  }

  if (!isSwapUnsupported && !account) {
    return TradeFormValidation.WalletNotConnected
  }

  if (!isSupportedWallet) {
    return TradeFormValidation.WalletNotSupported
  }

  if (isProviderNetworkUnsupported) {
    return TradeFormValidation.NetworkNotSupported
  }

  if (isSafeReadonlyUser) {
    return TradeFormValidation.SafeReadonlyUser
  }

  if (!inputCurrency || !outputCurrency) {
    return TradeFormValidation.CurrencyNotSet
  }

  if (inputAmountIsNotSet) {
    return TradeFormValidation.InputAmountNotSet
  }

  if (!isOnline) {
    return TradeFormValidation.BrowserOffline
  }

  if (!isWrapUnwrap) {
    if (recipient && !recipientEnsAddress && !isAddress(recipient)) {
      return TradeFormValidation.RecipientInvalid
    }

    if (isSwapUnsupported) {
      return TradeFormValidation.CurrencyNotSupported
    }

    if (isFastQuote || !tradeQuote.quote) {
      return TradeFormValidation.QuoteLoading
    }

    if (
      derivedTradeState.tradeType !== TradeType.LIMIT_ORDER &&
      !tradeQuote.isLoading &&
      !isFastQuote &&
      isQuoteExpired(tradeQuote)
    ) {
      return TradeFormValidation.QuoteExpired
    }
  }

  if (!canPlaceOrderWithoutBalance) {
    if (!inputCurrencyBalance) {
      return TradeFormValidation.BalancesNotLoaded
    }

    if (!amountToValidateAgainstBalance) {
      return TradeFormValidation.InputAmountNotSet
    }

    if (inputCurrencyBalance.lessThan(amountToValidateAgainstBalance)) {
      return TradeFormValidation.BalanceInsufficient
    }
  } else if (amountToValidateAgainstBalance && inputCurrencyBalance) {
    // For orders that can be placed without full balance (like limit orders),
    // still validate if user has enough for the actual amount including costs
    if (inputCurrencyBalance.lessThan(amountToValidateAgainstBalance)) {
      return TradeFormValidation.BalanceInsufficient
    }
  }

  if (isWrapUnwrap) {
    return TradeFormValidation.WrapUnwrapFlow
  }

  if (isNativeIn) {
    return TradeFormValidation.SellNativeToken
  }

  if (approvalRequired) {
    if (isBundlingSupported) {
      return TradeFormValidation.ApproveAndSwap
    }
    return TradeFormValidation.ApproveRequired
  }

  if (isNativeIn) {
    return TradeFormValidation.SellNativeToken
  }

  return null
}
