import { ApprovalState } from 'legacy/hooks/useApproveCallback'
import { isAddress } from 'legacy/utils'

import { isFractionFalsy } from 'utils/isFractionFalsy'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

export function validateTradeForm(context: TradeFormValidationContext): TradeFormValidation | null {
  const {
    derivedTradeState,
    approvalState,
    isTxBundlingEnabled,
    isWrapUnwrap,
    isExpertMode,
    isSupportedWallet,
    isSafeReadonlyUser,
    isSwapUnsupported,
    recipientEnsAddress,
    tradeQuote,
    account,
  } = context

  const { inputCurrency, outputCurrency, inputCurrencyAmount, inputCurrencyBalance, recipient } = derivedTradeState

  const approvalRequired = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

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
  }

  if (!inputCurrencyBalance) {
    return TradeFormValidation.BalancesNotLoaded
  }

  if (inputCurrencyBalance.lessThan(inputCurrencyAmount)) {
    return TradeFormValidation.BalanceInsufficient
  }

  if (isWrapUnwrap) {
    return TradeFormValidation.WrapUnwrapFlow
  }

  if (approvalRequired) {
    if (isTxBundlingEnabled) {
      if (isExpertMode) {
        return TradeFormValidation.ExpertApproveAndSwap
      }
      return TradeFormValidation.ApproveAndSwap
    }
    return TradeFormValidation.ApproveRequired
  }

  return null
}
