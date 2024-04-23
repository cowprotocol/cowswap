import { getIsNativeToken, isAddress, isFractionFalsy } from '@cowprotocol/common-utils'

import { TradeType } from 'modules/trade'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

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
  } = context

  const { inputCurrency, outputCurrency, inputCurrencyAmount, inputCurrencyBalance, recipient } = derivedTradeState
  const isBalanceGreaterThan1Atom = inputCurrencyBalance
    ? BigInt(inputCurrencyBalance.quotient.toString()) > BigInt(0)
    : false
  const canPlaceOrderWithoutBalance = isBalanceGreaterThan1Atom && isInsufficientBalanceOrderAllowed
  const isNativeIn = inputCurrency && getIsNativeToken(inputCurrency) && !isWrapUnwrap

  const approvalRequired =
    !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const inputAmountIsNotSet = !inputCurrencyAmount || isFractionFalsy(inputCurrencyAmount)

  if (!isWrapUnwrap && tradeQuote.error) {
    return TradeFormValidation.QuoteErrors
  }

  if (!isSwapUnsupported && !account) {
    return TradeFormValidation.WalletNotConnected
  }

  if (!isSupportedWallet) {
    return TradeFormValidation.WalletNotSupported
  }

  if (isSafeReadonlyUser) {
    return TradeFormValidation.SafeReadonlyUser
  }

  if (!inputCurrency || !outputCurrency) {
    return TradeFormValidation.CurrencyNotSet
  }

  if (isNativeIn) {
    return TradeFormValidation.SellNativeToken
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

    if (!tradeQuote.response) {
      return TradeFormValidation.QuoteLoading
    }

    if (
      derivedTradeState.tradeType !== TradeType.LIMIT_ORDER &&
      !tradeQuote.isLoading &&
      isQuoteExpired({
        expirationDate: tradeQuote.response?.expiration,
        deadlineParams: {
          validFor: tradeQuote.quoteParams?.validFor,
          quoteValidTo: tradeQuote.response.quote.validTo,
          localQuoteTimestamp: tradeQuote.localQuoteTimestamp,
        },
      })
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

  if (approvalRequired) {
    if (isBundlingSupported) {
      return TradeFormValidation.ApproveAndSwap
    }
    return TradeFormValidation.ApproveRequired
  }

  return null
}
