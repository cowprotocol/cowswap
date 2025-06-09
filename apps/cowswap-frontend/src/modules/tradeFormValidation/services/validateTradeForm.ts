import { getIsNativeToken, isAddress, isFractionFalsy } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { TradeType } from 'modules/trade'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

function validateConnectivityAndWallet(context: TradeFormValidationContext): TradeFormValidation | null {
  const { isSupportedWallet, isSafeReadonlyUser, isSwapUnsupported, account, isProviderNetworkUnsupported } = context

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

  return null
}

function validateQuoteErrors(context: TradeFormValidationContext): TradeFormValidation | null {
  const { isWrapUnwrap, tradeQuote } = context

  if (!isWrapUnwrap && tradeQuote.error) {
    return TradeFormValidation.QuoteErrors
  }

  return null
}

function validateBasicRequirements(context: TradeFormValidationContext): TradeFormValidation | null {
  const { isOnline, derivedTradeState } = context
  const { inputCurrency, outputCurrency, inputCurrencyAmount } = derivedTradeState
  const inputAmountIsNotSet = !inputCurrencyAmount || isFractionFalsy(inputCurrencyAmount)

  if (!inputCurrency || !outputCurrency) {
    return TradeFormValidation.CurrencyNotSet
  }

  if (inputAmountIsNotSet) {
    return TradeFormValidation.InputAmountNotSet
  }

  if (!isOnline) {
    return TradeFormValidation.BrowserOffline
  }

  return null
}

function validateQuoteState(context: TradeFormValidationContext): TradeFormValidation | null {
  const { tradeQuote, derivedTradeState } = context
  const isFastQuote = tradeQuote.fetchParams?.priceQuality === PriceQuality.FAST

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

  return null
}

function validateSwapSpecifics(context: TradeFormValidationContext): TradeFormValidation | null {
  const { isWrapUnwrap, isSwapUnsupported, recipientEnsAddress, derivedTradeState } = context
  const { recipient } = derivedTradeState

  if (isWrapUnwrap) {
    return null
  }

  if (recipient && !recipientEnsAddress && !isAddress(recipient)) {
    return TradeFormValidation.RecipientInvalid
  }

  if (isSwapUnsupported) {
    return TradeFormValidation.CurrencyNotSupported
  }

  return validateQuoteState(context)
}

function getAmountToValidate(context: TradeFormValidationContext): CurrencyAmount<Currency> | null {
  const { derivedTradeState, amountsToSign } = context
  const { isQuoteBasedOrder, inputCurrencyAmount } = derivedTradeState
  // For quote-based orders (like buy orders), use the maximum send amount that includes fees and slippage
  // Otherwise, use the input currency amount
  return isQuoteBasedOrder && amountsToSign ? amountsToSign.maximumSendSellAmount : inputCurrencyAmount
}

function canPlaceOrderWithoutFullBalance(context: TradeFormValidationContext): boolean {
  const { derivedTradeState, isInsufficientBalanceOrderAllowed, isWrapUnwrap } = context
  const { inputCurrencyBalance } = derivedTradeState
  const isBalanceGreaterThan1Atom = inputCurrencyBalance
    ? BigInt(inputCurrencyBalance.quotient.toString()) > BigInt(0)
    : false
  return isBalanceGreaterThan1Atom && isInsufficientBalanceOrderAllowed && !isWrapUnwrap
}

function validateBalance(context: TradeFormValidationContext): TradeFormValidation | null {
  const { derivedTradeState } = context
  const { inputCurrencyBalance } = derivedTradeState
  const canPlaceOrderWithoutBalance = canPlaceOrderWithoutFullBalance(context)
  const amountToValidateAgainstBalance = getAmountToValidate(context)

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

  return null
}

function validateFinalChecks(context: TradeFormValidationContext): TradeFormValidation | null {
  const { derivedTradeState, approvalState, isBundlingSupported, isWrapUnwrap, isPermitSupported } = context
  const { inputCurrency } = derivedTradeState

  const isNativeIn = inputCurrency && getIsNativeToken(inputCurrency) && !isWrapUnwrap
  const approvalRequired =
    !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

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

export function validateTradeForm(context: TradeFormValidationContext): TradeFormValidation | null {
  return (
    validateQuoteErrors(context) ||
    validateConnectivityAndWallet(context) ||
    validateBasicRequirements(context) ||
    validateSwapSpecifics(context) ||
    validateBalance(context) ||
    validateFinalChecks(context)
  )
}
