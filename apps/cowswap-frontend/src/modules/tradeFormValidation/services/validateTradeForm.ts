import { getIsNativeToken, isAddress, isFractionFalsy, isSellOrder } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ApproveRequiredReason } from '../../erc20Approve'
import { TradeFormValidation, TradeFormValidationContext } from '../types'

// eslint-disable-next-line max-lines-per-function, complexity
export function validateTradeForm(context: TradeFormValidationContext): TradeFormValidation[] | null {
  const {
    derivedTradeState,
    isWrapUnwrap,
    isSupportedWallet,
    isSafeReadonlyUser,
    isSwapUnsupported,
    recipientEnsAddress,
    tradeQuote,
    account,
    isApproveRequired,
    isInsufficientBalanceOrderAllowed,
    isProviderNetworkUnsupported,
    isOnline,
    intermediateTokenToBeImported,
    isAccountProxyLoading,
    isProxySetupValid,
    customTokenError,
    isRestrictedForCountry,
    isBalancesLoading,
  } = context

  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    recipient,
    orderKind,
  } = derivedTradeState
  const isBalanceGreaterThan1Atom = inputCurrencyBalance
    ? BigInt(inputCurrencyBalance.quotient.toString()) > BigInt(0)
    : false
  const canPlaceOrderWithoutBalance = isBalanceGreaterThan1Atom && isInsufficientBalanceOrderAllowed && !isWrapUnwrap
  const isNativeIn = inputCurrency && getIsNativeToken(inputCurrency) && !isWrapUnwrap

  const inputAmountIsNotSet = isSellOrder(orderKind)
    ? !inputCurrencyAmount || isFractionFalsy(inputCurrencyAmount)
    : !outputCurrencyAmount || isFractionFalsy(outputCurrencyAmount)

  const isBridging = Boolean(inputCurrency && outputCurrency && inputCurrency.chainId !== outputCurrency.chainId)

  const { isLoading: isQuoteLoading, fetchParams } = tradeQuote
  const isFastQuote = fetchParams?.priceQuality === PriceQuality.FAST

  const validations: TradeFormValidation[] = []

  // Always check if the browser is online before checking any other conditions
  if (!isOnline) {
    validations.push(TradeFormValidation.BrowserOffline)
  }

  if (customTokenError) {
    validations.push(TradeFormValidation.CustomTokenError)
  }

  if (isRestrictedForCountry) {
    validations.push(TradeFormValidation.RestrictedForCountry)
  }

  if (!isWrapUnwrap && tradeQuote.error) {
    if (inputAmountIsNotSet) {
      validations.push(TradeFormValidation.InputAmountNotSet)
    }

    if (!tradeQuote.isLoading) {
      validations.push(TradeFormValidation.QuoteErrors)
    }
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
    const isRecipientAddress = Boolean(recipient && isAddress(recipient))

    /**
     * For bridging, recipient can be only an address (ENS is not supported)
     */
    const isRecipientValid = isBridging ? isRecipientAddress : recipientEnsAddress ? true : isRecipientAddress

    if (recipient && !isRecipientValid) {
      validations.push(TradeFormValidation.RecipientInvalid)
    }

    if (isSwapUnsupported) {
      validations.push(TradeFormValidation.CurrencyNotSupported)
    }

    if (isFastQuote || !tradeQuote.quote || (isBridging && tradeQuote.isLoading)) {
      validations.push(TradeFormValidation.QuoteLoading)
    }

    if (
      derivedTradeState.tradeType !== TradeType.LIMIT_ORDER &&
      !isQuoteLoading &&
      !isFastQuote &&
      isQuoteExpired(tradeQuote)
    ) {
      validations.push(TradeFormValidation.QuoteExpired)
    }

    if (isBridging && !isQuoteLoading) {
      if (isAccountProxyLoading || typeof isProxySetupValid === 'undefined') {
        validations.push(TradeFormValidation.ProxyAccountLoading)
      }

      if (isProxySetupValid === null) {
        validations.push(TradeFormValidation.ProxyAccountUnknown)
      }
    }
  }

  if (!canPlaceOrderWithoutBalance && !isBalancesLoading) {
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

  if (![ApproveRequiredReason.Unsupported, ApproveRequiredReason.NotRequired].includes(isApproveRequired)) {
    if (isApproveRequired === ApproveRequiredReason.BundleApproveRequired) {
      validations.push(TradeFormValidation.ApproveAndSwapInBundle)
    }
    validations.push(TradeFormValidation.ApproveRequired)
  }

  if (intermediateTokenToBeImported) {
    validations.push(TradeFormValidation.ImportingIntermediateToken)
  }

  if (isNativeIn) {
    validations.push(TradeFormValidation.SellNativeToken)
  }

  return validations.length > 0 ? validations : null
}
