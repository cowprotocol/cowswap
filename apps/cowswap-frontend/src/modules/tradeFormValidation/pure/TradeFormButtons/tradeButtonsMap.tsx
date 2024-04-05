import React from 'react'

import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'

import { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'
import { TradeApproveButton } from 'common/containers/TradeApprove'
import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

interface ButtonErrorConfig {
  text: JSX.Element | string
  id?: string
}

interface ButtonCallback {
  (context: TradeFormButtonContext, isDisabled?: boolean): JSX.Element | null
}

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

const quoteErrorTexts: Record<GpQuoteErrorCodes, string> = {
  [GpQuoteErrorCodes.UNHANDLED_ERROR]: 'Error loading price. Try again later.',
  [GpQuoteErrorCodes.TransferEthToContract]:
    'Buying native currency with smart contract wallets is not currently supported',
  [GpQuoteErrorCodes.UnsupportedToken]: 'Unsupported token',
  [GpQuoteErrorCodes.InsufficientLiquidity]: 'Insufficient liquidity for this trade.',
  [GpQuoteErrorCodes.FeeExceedsFrom]: 'Sell amount is too small',
  [GpQuoteErrorCodes.ZeroPrice]: 'Invalid price. Try increasing input/output amount.',
  [GpQuoteErrorCodes.SameBuyAndSellToken]: 'Tokens must be different',
}

const unsupportedTokenButton = (context: TradeFormButtonContext) => {
  const { derivedState, isSupportedWallet } = context
  const { inputCurrency, outputCurrency } = derivedState

  return inputCurrency && outputCurrency ? (
    <>
      <TradeFormBlankButton disabled={true}>
        <Trans>Unsupported token</Trans>
      </TradeFormBlankButton>
      <CompatibilityIssuesWarningWrapper>
        <CompatibilityIssuesWarning
          currencyIn={inputCurrency}
          currencyOut={outputCurrency}
          isSupportedWallet={isSupportedWallet}
        />
      </CompatibilityIssuesWarningWrapper>
    </>
  ) : null
}

export const tradeButtonsMap: Record<TradeFormValidation, ButtonErrorConfig | ButtonCallback> = {
  [TradeFormValidation.WrapUnwrapFlow]: (context) => {
    const isNativeIn = !!context.derivedState.inputCurrency && getIsNativeToken(context.derivedState.inputCurrency)

    return (
      <TradeFormBlankButton onClick={() => context.wrapNativeFlow()}>
        <Trans>{isNativeIn ? 'Wrap' : 'Unwrap'}</Trans>
      </TradeFormBlankButton>
    )
  },

  [TradeFormValidation.CurrencyNotSet]: {
    text: 'Select a token',
  },
  [TradeFormValidation.InputAmountNotSet]: {
    text: 'Enter an amount',
  },
  [TradeFormValidation.RecipientInvalid]: {
    text: 'Enter a valid recipient',
  },
  [TradeFormValidation.CurrencyNotSupported]: (context) => {
    return unsupportedTokenButton(context)
  },
  [TradeFormValidation.QuoteErrors]: (context) => {
    const { quote } = context
    const defaultError = quoteErrorTexts[GpQuoteErrorCodes.UNHANDLED_ERROR]

    if (quote.error?.type === GpQuoteErrorCodes.UnsupportedToken) {
      return unsupportedTokenButton(context)
    }

    return (
      <TradeFormBlankButton disabled={true}>
        <Trans>{(quote.error && quoteErrorTexts[quote.error.type]) || defaultError}</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.QuoteExpired]: { text: 'Quote expired. Refreshing...' },
  [TradeFormValidation.WalletNotConnected]: (context) => {
    return (
      <TradeFormBlankButton
        onClick={context.connectWallet || undefined}
        disabled={!context.connectWallet || context.widgetStandaloneMode === false}
      >
        <Trans>Connect Wallet</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.WalletNotSupported]: {
    text: 'Wallet Unsupported',
  },
  [TradeFormValidation.SafeReadonlyUser]: {
    text: 'Read Only',
  },
  [TradeFormValidation.QuoteLoading]: {
    text: <TradeLoadingButton />,
  },
  [TradeFormValidation.BalancesNotLoaded]: {
    text: "Couldn't load balances",
  },
  [TradeFormValidation.BalanceInsufficient]: (context) => {
    return (
      <TradeFormBlankButton disabled={true}>
        <Trans>Insufficient&nbsp;{<TokenSymbol token={context.derivedState.inputCurrency} />}&nbsp;balance</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveAndSwap]: (context, isDisabled = false) => {
    const currency = context.derivedState.slippageAdjustedSellAmount?.currency
    const tokenToApprove = currency && getWrappedToken(currency)

    return (
      <TradeFormBlankButton disabled={isDisabled} onClick={context.confirmTrade}>
        <Trans>
          Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText}
        </Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveRequired]: (context, isDisabled = false) => {
    const amountToApprove = context.derivedState.slippageAdjustedSellAmount

    if (!amountToApprove) return null

    return (
      <TradeApproveButton isDisabled={isDisabled} amountToApprove={amountToApprove}>
        <TradeFormBlankButton disabled={true}>
          <Trans>{context.defaultText}</Trans>
        </TradeFormBlankButton>
      </TradeApproveButton>
    )
  },
  [TradeFormValidation.SellNativeToken]: (context) => {
    const currency = context.derivedState.inputCurrency
    const isNativeIn = !!currency && getIsNativeToken(currency)

    if (!isNativeIn) return null

    return (
      <TradeFormBlankButton disabled>
        <Trans>Selling {currency.symbol} is not supported</Trans>
      </TradeFormBlankButton>
    )
  },
}
