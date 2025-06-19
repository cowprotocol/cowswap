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
  } = context

  const { inputCurrency, outputCurrency, inputCurrencyAmount, inputCurrencyBalance, recipient } = derivedTradeState
  const isBalanceGreaterThan1Atom = inputCurrencyBalance
    ? BigInt(inputCurrencyBalance.quotient.toString()) > BigInt(0)
    : false
  const canPlaceOrderWithoutBalance = isBalanceGreaterThan1Atom && isInsufficientBalanceOrderAllowed && !isWrapUnwrap
  const isNativeIn = inputCurrency && getIsNativeToken(inputCurrency) && !isWrapUnwrap

  const approvalRequired =
    !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const inputAmountIsNotSet = !inputCurrencyAmount || isFractionFalsy(inputCurrencyAmount)
  const isFastQuote = tradeQuote.fetchParams?.priceQuality === PriceQuality.FAST

  // Always check if the browser is online before checking any other conditions
  if (!isOnline) {
    return TradeFormValidation.BrowserOffline
  }

  if (!isWrapUnwrap && tradeQuote.error) {
    if (inputAmountIsNotSet) {
      return TradeFormValidation.InputAmountNotSet
    }

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

    if (inputCurrencyBalance.lessThan(inputCurrencyAmount)) {
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
