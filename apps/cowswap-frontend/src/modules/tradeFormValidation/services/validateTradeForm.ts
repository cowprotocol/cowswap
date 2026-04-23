import { getCurrencyAddress, getIsNativeToken, isFractionFalsy, isSellOrder } from '@cowprotocol/common-utils'
import { areAddressesEqual, isEvmChain } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'
import { getIsFastQuote, isQuoteExpired } from 'modules/tradeQuote'

import { getAddressValidationStrategy } from 'common/utils/addressValidation'

import { getIsXstockTradeBelowLimit } from './getIsXstockTradeBelowLimit'

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
    isProviderNetworkDeprecated,
    isOnline,
    intermediateTokenToBeImported,
    isAccountProxyLoading,
    isProxySetupValid,
    customTokenError,
    isRestrictedForCountry,
    isBalancesLoading,
    isBundlingSupported,
    injectedWidgetParams,
    tradePriceImpact,
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
  const isFastQuote = getIsFastQuote(fetchParams)

  const isXstockTradeBelowLimit = getIsXstockTradeBelowLimit(context)

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

  // Return early as these take precedence
  if (validations.length > 0) {
    return validations
  }

  // If the xstock trade amount is below the minimum trade size, we want to show a specific error message,
  // even if there are other issues with the trade (e.g. quote loading or wallet not connected)
  if (!inputAmountIsNotSet && isXstockTradeBelowLimit) {
    return [TradeFormValidation.XstockMinimumTradeSize]
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

  if (isProviderNetworkDeprecated) {
    validations.push(TradeFormValidation.NetworkDeprecated)
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

  const isNonEvmBridging = isBridging && outputCurrency && !isEvmChain(outputCurrency.chainId)

  if (!isWrapUnwrap) {
    if (isNonEvmBridging && !recipient) {
      validations.push(TradeFormValidation.RecipientNotSet)
    }

    const strategy = getAddressValidationStrategy(isNonEvmBridging ? outputCurrency.chainId : undefined)
    const isRecipientAddress = Boolean(recipient && strategy.isValidAddress(recipient))

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

  if (isWrapUnwrap) {
    validations.push(TradeFormValidation.WrapUnwrapFlow)
  }

  const { whenPriceImpactIsHigherThan, whenPriceImpactIsUnknown } = injectedWidgetParams?.disableTrade || {}

  const checkHighPriceImpact = typeof whenPriceImpactIsHigherThan === 'number'
  const checkUnknownPriceImpact = whenPriceImpactIsUnknown || checkHighPriceImpact

  if (!isWrapUnwrap && checkUnknownPriceImpact) {
    const isPriceImpactUnknown = !tradePriceImpact.loading && !tradePriceImpact.priceImpact

    if (isPriceImpactUnknown) {
      validations.push(TradeFormValidation.DisableTradeWithUnknownPriceImpact)
    }

    if (tradePriceImpact.loading) {
      validations.push(TradeFormValidation.ImpactLoading)
    }
  }

  if (!isWrapUnwrap && checkHighPriceImpact && tradePriceImpact.priceImpact) {
    const priceImpactAsNum = +tradePriceImpact.priceImpact.toSignificant()
    const isPriceImpactAboveThreshold = priceImpactAsNum > whenPriceImpactIsHigherThan

    if (isPriceImpactAboveThreshold) {
      validations.push(TradeFormValidation.DisableTradeWithHighPriceImpact)
    }
  }

  if (injectedWidgetParams.tokenPairConstraints && inputCurrency && outputCurrency) {
    const isTradeConstrained = injectedWidgetParams.tokenPairConstraints.some((rule) => {
      return (
        rule.sell.chainId === inputCurrency.chainId &&
        areAddressesEqual(rule.sell.address, getCurrencyAddress(inputCurrency)) &&
        rule.buy.chainId === outputCurrency.chainId &&
        areAddressesEqual(rule.buy.address, getCurrencyAddress(outputCurrency))
      )
    })

    if (isTradeConstrained) {
      validations.push(TradeFormValidation.WidgetConstrainedTokenPair)
    }
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
