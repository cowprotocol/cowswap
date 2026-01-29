import { getIsNativeToken, isAddress, isFractionFalsy, isSellOrder } from '@cowprotocol/common-utils'

import { isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'

import { TradeType } from 'modules/trade'
import { getIsFastQuote, isQuoteExpired } from 'modules/tradeQuote'

import { getChainType } from 'common/chains/nonEvm'
import { validateRecipientForChain } from 'common/recipient/nonEvmRecipientValidation'

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
    recipientRequirement,
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
    isBundlingSupported,
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
  const isNonEvmPrototype = isNonEvmPrototypeEnabled()
  const outputChainId = outputCurrency?.chainId
  const outputChainType = getChainType(outputChainId)
  const isNonEvmDestination = isNonEvmPrototype && outputChainType !== 'evm'

  const { isLoading: isQuoteLoading, fetchParams } = tradeQuote
  const isFastQuote = getIsFastQuote(fetchParams)

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

  if (!!account && isBundlingSupported === null) {
    validations.push(TradeFormValidation.WalletCapabilitiesLoading)
  }

  if (!canPlaceOrderWithoutBalance && !!account) {
    if (!inputCurrencyBalance && isBalancesLoading) {
      validations.push(TradeFormValidation.BalancesLoading)
    }

    if (!inputCurrencyBalance && !isBalancesLoading) {
      validations.push(TradeFormValidation.BalancesNotLoaded)
    }

    if (inputCurrencyBalance && inputCurrencyAmount && inputCurrencyBalance.lessThan(inputCurrencyAmount)) {
      validations.push(TradeFormValidation.BalanceInsufficient)
    }
  }

  if (!isWrapUnwrap) {
    const shouldUseNonEvmRecipientRules = recipientRequirement.isRecipientRequired || isNonEvmDestination

    if (shouldUseNonEvmRecipientRules) {
      const recipientValue = recipient?.trim() ?? ''
      const isRecipientMissing = recipientValue.length === 0
      const destinationChainId = isNonEvmDestination ? outputChainId : recipientRequirement.destinationChainId
      const validationResult =
        !isRecipientMissing && destinationChainId ? validateRecipientForChain(destinationChainId, recipientValue) : null
      const isRecipientValid = isRecipientMissing || validationResult?.isValid !== false

      // In the non-EVM prototype, recipient is not required for quotes, but we still
      // surface invalid formats once the user types something.
      if (isNonEvmPrototype) {
        if (isRecipientMissing) {
          validations.push(TradeFormValidation.RecipientRequiredNonEvmPrototype)
        } else if (!isRecipientValid) {
          validations.push(TradeFormValidation.RecipientInvalidNonEvm)
        }
      } else if (isRecipientMissing) {
        validations.push(TradeFormValidation.RecipientRequired)
      } else if (!isRecipientValid) {
        validations.push(TradeFormValidation.RecipientInvalidNonEvm)
      }
    } else {
      const isRecipientAddress = Boolean(recipient && isAddress(recipient))

      /**
       * For bridging, recipient can be only an address (ENS is not supported)
       */
      const isRecipientValid = isBridging ? isRecipientAddress : recipientEnsAddress ? true : isRecipientAddress

      if (recipient && !isRecipientValid) {
        validations.push(TradeFormValidation.RecipientInvalid)
      }
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
      !(isNonEvmDestination && isNonEvmPrototype) &&
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
