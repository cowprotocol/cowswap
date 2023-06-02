import React from 'react'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { CompatibilityIssuesWarning } from 'modules/trade/pure/CompatibilityIssuesWarning'
import { TradeLoadingButton } from 'modules/trade/pure/TradeLoadingButton'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { TradeQuoteState } from 'modules/tradeQuote'

import { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'
import { TradeApproveButton } from 'common/containers/TradeApprove'
import { TokenSymbol } from 'common/pure/TokenSymbol'

import { TradeFormValidation } from '../../types'
import { TradeFormPrimaryButton } from '../TradeFormPrimaryButton'

export interface TradeFormButtonContext {
  defaultText: string
  derivedState: TradeDerivedState
  quote: TradeQuoteState
  isSupportedWallet: boolean
  doTrade(): void
  confirmTrade(): void
  connectWallet(): void
  wrapNativeFlow(): void
}

interface ButtonErrorConfig {
  text: JSX.Element | string
  id?: string
}

interface ButtonCallback {
  (context: TradeFormButtonContext): JSX.Element | null
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
}

const buttonsMap: Record<TradeFormValidation, ButtonErrorConfig | ButtonCallback> = {
  [TradeFormValidation.WrapUnwrapAmountNotSet]: {
    text: 'Enter an amount',
  },
  [TradeFormValidation.WrapUnwrapFlow]: (context) => {
    const isNativeIn = !!context.derivedState.inputCurrency?.isNative

    return (
      <TradeFormPrimaryButton onClick={context.wrapNativeFlow}>
        <Trans>{isNativeIn ? 'Wrap' : 'Unwrap'}</Trans>
      </TradeFormPrimaryButton>
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
    const { derivedState, isSupportedWallet } = context
    const { inputCurrency, outputCurrency } = derivedState

    return inputCurrency && outputCurrency ? (
      <>
        <TradeFormPrimaryButton disabled={true}>
          <Trans>Unsupported token</Trans>
        </TradeFormPrimaryButton>
        <CompatibilityIssuesWarningWrapper>
          <CompatibilityIssuesWarning
            currencyIn={inputCurrency}
            currencyOut={outputCurrency}
            isSupportedWallet={isSupportedWallet}
          />
        </CompatibilityIssuesWarningWrapper>
      </>
    ) : null
  },
  [TradeFormValidation.QuoteErrors]: (context) => {
    const { quote } = context
    const defaultError = quoteErrorTexts[GpQuoteErrorCodes.UNHANDLED_ERROR]

    return (
      <TradeFormPrimaryButton disabled={true}>
        <Trans>{(quote.error && quoteErrorTexts[quote.error.type]) || defaultError}</Trans>
      </TradeFormPrimaryButton>
    )
  },
  [TradeFormValidation.WalletNotConnected]: (context) => {
    return (
      <TradeFormPrimaryButton onClick={context.connectWallet}>
        <Trans>Connect Wallet</Trans>
      </TradeFormPrimaryButton>
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
      <TradeFormPrimaryButton disabled={true}>
        <Trans>Insufficient&nbsp;{<TokenSymbol token={context.derivedState.inputCurrency} />}&nbsp;balance</Trans>
      </TradeFormPrimaryButton>
    )
  },
  [TradeFormValidation.ExpertApproveAndSwap]: (context) => {
    const tokenToApprove = context.derivedState.slippageAdjustedSellAmount?.currency.wrapped

    return (
      <TradeFormPrimaryButton onClick={context.doTrade}>
        <Trans>
          Confirm (Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText})
        </Trans>
      </TradeFormPrimaryButton>
    )
  },
  [TradeFormValidation.ApproveAndSwap]: (context) => {
    const tokenToApprove = context.derivedState.slippageAdjustedSellAmount?.currency.wrapped

    return (
      <TradeFormPrimaryButton onClick={context.confirmTrade}>
        <Trans>
          Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText}
        </Trans>
      </TradeFormPrimaryButton>
    )
  },
  [TradeFormValidation.ApproveRequired]: (context) => {
    const amountToApprove = context.derivedState.slippageAdjustedSellAmount

    if (!amountToApprove) return null

    return (
      <TradeApproveButton amountToApprove={amountToApprove}>
        <TradeFormPrimaryButton disabled={true}>
          <Trans>{context.defaultText}</Trans>
        </TradeFormPrimaryButton>
      </TradeApproveButton>
    )
  },
}

export interface TradeFormButtonProps {
  validation: TradeFormValidation | null
  context: TradeFormButtonContext
  doTradeText: string
  confirmText: string
  isExpertMode: boolean
  isDisabled?: boolean
}

export function TradeFormButton(props: TradeFormButtonProps) {
  const { validation, context, isExpertMode, isDisabled, doTradeText, confirmText } = props

  if (!validation) {
    return (
      <TradeFormPrimaryButton
        disabled={isDisabled}
        onClick={() => (isExpertMode ? context.doTrade() : context.confirmTrade())}
      >
        {isExpertMode ? doTradeText : confirmText}
      </TradeFormPrimaryButton>
    )
  }

  const buttonFactory = buttonsMap[validation]

  if (typeof buttonFactory === 'function') {
    return buttonFactory(context)
  }

  return (
    <TradeFormPrimaryButton id={buttonFactory.id} disabled={true}>
      <Trans>{buttonFactory.text}</Trans>
    </TradeFormPrimaryButton>
  )
}
