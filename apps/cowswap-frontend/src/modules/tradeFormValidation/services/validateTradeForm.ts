import { getIsNativeToken, isAddress, isFractionFalsy } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

// eslint-disable-next-line max-lines-per-function, complexity
export function validateTradeForm(context: TradeFormValidationContext): TradeFormValidation[] | null {
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

  const validations: TradeFormValidation[] = []

  // Always check if the browser is online before checking any other conditions
  if (!isOnline) {
    validations.push(TradeFormValidation.BrowserOffline)
  }

  if (!isWrapUnwrap && tradeQuote.error) {
    if (inputAmountIsNotSet) {
      validations.push(TradeFormValidation.InputAmountNotSet)
    }

    validations.push(TradeFormValidation.QuoteErrors)
  }

  if (!isSwapUnsupported && !account) {
    validations.push(TradeFormValidation.WalletNotConnected)
  }

  if (!isSupportedWallet) {
    validations.push(TradeFormValidation.WalletNotSupported)
  }

  if (isProviderNetworkUnsupported) {
    validations.push(TradeFormValidation.NetworkNotSupported)
  }

  if (isSafeReadonlyUser) {
    validations.push(TradeFormValidation.SafeReadonlyUser)
  }

  if (!inputCurrency || !outputCurrency) {
    validations.push(TradeFormValidation.CurrencyNotSet)
  }

  if (inputAmountIsNotSet) {
    validations.push(TradeFormValidation.InputAmountNotSet)
  }

  if (!isWrapUnwrap) {
    if (recipient && !recipientEnsAddress && !isAddress(recipient)) {
      validations.push(TradeFormValidation.RecipientInvalid)
    }

    if (isSwapUnsupported) {
      validations.push(TradeFormValidation.CurrencyNotSupported)
    }

    if (isFastQuote || !tradeQuote.quote) {
      validations.push(TradeFormValidation.QuoteLoading)
    }

    if (
      derivedTradeState.tradeType !== TradeType.LIMIT_ORDER &&
      !tradeQuote.isLoading &&
      !isFastQuote &&
      isQuoteExpired(tradeQuote)
    ) {
      validations.push(TradeFormValidation.QuoteExpired)
    }
  }

  if (!canPlaceOrderWithoutBalance) {
    if (!inputCurrencyBalance) {
      validations.push(TradeFormValidation.BalancesNotLoaded)
    }

    if (inputCurrencyBalance && inputCurrencyAmount && inputCurrencyBalance.lessThan(inputCurrencyAmount)) {
      validations.push(TradeFormValidation.BalanceInsufficient)
    }
  }

  if (isWrapUnwrap) {
    validations.push(TradeFormValidation.WrapUnwrapFlow)
  }

  if (isNativeIn) {
    validations.push(TradeFormValidation.SellNativeToken)
  }

  if (approvalRequired) {
    if (isBundlingSupported) {
      validations.push(TradeFormValidation.ApproveAndSwap)
    }
    validations.push(TradeFormValidation.ApproveRequired)
  }

  if (isNativeIn) {
    validations.push(TradeFormValidation.SellNativeToken)
  }

  return validations.length > 0 ? validations : null
}
