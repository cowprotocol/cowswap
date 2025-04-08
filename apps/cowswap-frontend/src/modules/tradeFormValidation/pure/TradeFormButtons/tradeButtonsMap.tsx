import { ReactElement } from 'react'

import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { TradeApproveButton } from 'modules/erc20Approval'
import { CompatibilityIssuesWarning } from 'modules/trade'

import { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

interface ButtonErrorConfig {
  text: ReactElement | string
  id?: string
}

interface ButtonCallback {
  (context: TradeFormButtonContext, isDisabled?: boolean): ReactElement | null
}

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

const quoteErrorTexts: Record<QuoteApiErrorCodes, string> = {
  [QuoteApiErrorCodes.UNHANDLED_ERROR]: 'Error loading price. Try again later.',
  [QuoteApiErrorCodes.TransferEthToContract]:
    'Buying native currency with smart contract wallets is not currently supported',
  [QuoteApiErrorCodes.UnsupportedToken]: 'Unsupported token',
  [QuoteApiErrorCodes.InsufficientLiquidity]: 'Insufficient liquidity for this trade.',
  [QuoteApiErrorCodes.FeeExceedsFrom]: 'Sell amount is too small',
  [QuoteApiErrorCodes.ZeroPrice]: 'Invalid price. Try increasing input/output amount.',
  [QuoteApiErrorCodes.SameBuyAndSellToken]: 'Tokens must be different',
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
  [TradeFormValidation.BrowserOffline]: {
    text: 'Error loading price. You are currently offline.',
  },
  [TradeFormValidation.RecipientInvalid]: {
    text: 'Enter a valid recipient',
  },
  [TradeFormValidation.CurrencyNotSupported]: (context) => {
    return unsupportedTokenButton(context)
  },
  [TradeFormValidation.QuoteErrors]: (context) => {
    const { quote } = context
    const defaultError = quoteErrorTexts[QuoteApiErrorCodes.UNHANDLED_ERROR]

    if (quote.error?.type === QuoteApiErrorCodes.UnsupportedToken) {
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
      <TradeFormBlankButton onClick={context.connectWallet} disabled={context.widgetStandaloneMode === false}>
        <Trans>Connect Wallet</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.WalletNotSupported]: {
    text: 'Wallet Unsupported',
  },
  [TradeFormValidation.NetworkNotSupported]: {
    text: 'Unsupported Network',
  },
  [TradeFormValidation.SafeReadonlyUser]: {
    text: (
      <>
        <span>Connect signer</span>{' '}
        <HelpTooltip
          text={
            <div>
              Your Safe is not connected with a signer.
              <br />
              To place an order, you must connect using a signer of this Safe.
            </div>
          }
        />
      </>
    ),
  },
  [TradeFormValidation.QuoteLoading]: {
    text: <TradeLoadingButton />,
  },
  [TradeFormValidation.BalancesNotLoaded]: {
    text: "Couldn't load balances",
  },
  [TradeFormValidation.BalanceInsufficient]: (context) => {
    const inputCurrency = context.derivedState.inputCurrency

    return (
      <TradeFormBlankButton disabled={true}>
        <Trans>Insufficient&nbsp;{<TokenSymbol token={inputCurrency} />}&nbsp;balance</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveAndSwap]: (context, isDisabled = false) => {
    const inputCurrency = context.derivedState.inputCurrency
    const tokenToApprove = inputCurrency && getWrappedToken(inputCurrency)

    return (
      <TradeFormBlankButton disabled={isDisabled} onClick={context.confirmTrade}>
        <Trans>
          Approve&nbsp;{<TokenSymbol token={tokenToApprove} length={6} />}&nbsp;and {context.defaultText}
        </Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveRequired]: (context) => {
    if (!context.amountsToSign) return null
    const { maximumSendSellAmount } = context.amountsToSign

    return (
      <TradeApproveButton amountToApprove={maximumSendSellAmount}>
        <TradeFormBlankButton disabled={true}>
          <Trans>{context.defaultText}</Trans>
        </TradeFormBlankButton>
      </TradeApproveButton>
    )
  },
  [TradeFormValidation.SellNativeToken]: (context) => {
    const inputCurrency = context.derivedState.inputCurrency
    const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)

    if (!isNativeIn) return null

    return (
      <TradeFormBlankButton disabled>
        <Trans>Selling {inputCurrency.symbol} is not supported</Trans>
      </TradeFormBlankButton>
    )
  },
}
