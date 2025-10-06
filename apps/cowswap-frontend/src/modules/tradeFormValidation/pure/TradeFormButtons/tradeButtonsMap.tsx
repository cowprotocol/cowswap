import { ReactElement, ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '@cowprotocol/sdk-bridging'
import { CenteredDots, HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { TradeApproveButton } from 'modules/erc20Approve'
import { CompatibilityIssuesWarning } from 'modules/trade'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { TradeFormBlankButton } from '../TradeFormBlankButton'

interface ButtonErrorConfig {
  text: ReactNode
  id?: string
}

interface ButtonCallback {
  (context: TradeFormButtonContext, isDisabled?: boolean): ReactElement | null
}

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

const ProxyAccountLoading = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return (
    <>
      <span>
        <Trans>Loading {accountProxyLabel}</Trans>
      </span>
      <CenteredDots smaller />
    </>
  )
}

const ProxyAccountUnknown = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return <Trans>Couldn't verify {accountProxyLabel}, please try later</Trans>
}

export const tradeButtonsMap: Record<TradeFormValidation, ButtonErrorConfig | ButtonCallback> = {
  [TradeFormValidation.WrapUnwrapFlow]: (context) => {
    const isNativeIn = !!context.derivedState.inputCurrency && getIsNativeToken(context.derivedState.inputCurrency)

    return (
      <TradeFormBlankButton onClick={() => context.wrapNativeFlow()}>
        {isNativeIn ? t`Wrap` : t`Unwrap`}
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.CustomTokenError]: ({ customTokenError }) => {
    return (
      <TradeFormBlankButton disabled={true}>
        <span>{customTokenError}</span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.CurrencyNotSet]: {
    text: <Trans>Select a token</Trans>,
  },
  [TradeFormValidation.InputAmountNotSet]: {
    text: <Trans>Enter an amount</Trans>,
  },
  [TradeFormValidation.BrowserOffline]: {
    text: <Trans>Error loading price. You are currently offline.</Trans>,
  },
  [TradeFormValidation.RecipientInvalid]: ({ derivedState: { inputCurrency, outputCurrency, recipient } }) => {
    const isBridging = inputCurrency && outputCurrency && inputCurrency.chainId !== outputCurrency.chainId

    return (
      <TradeFormBlankButton disabled>
        <>
          <Trans>Enter a valid recipient</Trans>
          {isBridging && recipient && (
            <HelpTooltip
              placement="top"
              text={t`ENS recipient not supported for Swap and Bridge. Use address instead.`}
            />
          )}
        </>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.CurrencyNotSupported]: (context) => {
    return unsupportedTokenButton(context)
  },
  [TradeFormValidation.QuoteErrors]: (context) => {
    const DEFAULT_QUOTE_ERROR = t`Error loading price. Try again later.`

    const quoteErrorTexts: Record<QuoteApiErrorCodes, string> = {
      [QuoteApiErrorCodes.UNHANDLED_ERROR]: DEFAULT_QUOTE_ERROR,
      [QuoteApiErrorCodes.TransferEthToContract]: t`Buying native currency with smart contract wallets is not currently supported`,
      [QuoteApiErrorCodes.UnsupportedToken]: t`Unsupported token`,
      [QuoteApiErrorCodes.InsufficientLiquidity]: t`Insufficient liquidity for this trade.`,
      [QuoteApiErrorCodes.FeeExceedsFrom]: t`Sell amount is too small`,
      [QuoteApiErrorCodes.ZeroPrice]: t`Invalid price. Try increasing input/output amount.`,
      [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Tokens must be different`,
    }

    const quoteErrorTextsForBridges: Partial<Record<QuoteApiErrorCodes, string>> = {
      [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Not yet supported`,
    }

    const bridgeQuoteErrorTexts: Record<BridgeQuoteErrors, string> = {
      [BridgeQuoteErrors.API_ERROR]: DEFAULT_QUOTE_ERROR,
      [BridgeQuoteErrors.INVALID_BRIDGE]: DEFAULT_QUOTE_ERROR,
      [BridgeQuoteErrors.TX_BUILD_ERROR]: DEFAULT_QUOTE_ERROR,
      [BridgeQuoteErrors.QUOTE_ERROR]: DEFAULT_QUOTE_ERROR,
      [BridgeQuoteErrors.INVALID_API_JSON_RESPONSE]: DEFAULT_QUOTE_ERROR,
      [BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS]: t`No routes found`,
      [BridgeQuoteErrors.NO_ROUTES]: t`No routes found`,
      [BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED]: t`Only "sell" orders are supported`,
    }

    const errorTooltipContentForBridges: Partial<Record<QuoteApiErrorCodes, string>> = {
      [QuoteApiErrorCodes.SameBuyAndSellToken]: t`Bridging without swapping is not yet supported. Let us know if you want this feature!`,
    }

    const { quote } = context

    if (quote.error instanceof QuoteApiError) {
      const errorType = quote.error.type

      if (errorType === QuoteApiErrorCodes.UnsupportedToken) {
        return unsupportedTokenButton(context)
      }

      const isBridge = quote.isBridgeQuote
      const errorText =
        (isBridge && quoteErrorTextsForBridges[errorType]) || quoteErrorTexts[errorType] || DEFAULT_QUOTE_ERROR

      const errorTooltipText = isBridge && errorTooltipContentForBridges[errorType]

      return (
        <TradeFormBlankButton disabled={true}>
          <>
            {errorText}
            {errorTooltipText && <HelpTooltip text={errorTooltipText} />}
          </>
        </TradeFormBlankButton>
      )
    }

    if (quote.error instanceof BridgeProviderQuoteError) {
      const errorMessage = quote.error.message as BridgeQuoteErrors
      const errorText = bridgeQuoteErrorTexts[errorMessage] || DEFAULT_QUOTE_ERROR

      return (
        <TradeFormBlankButton disabled={true}>
          <>{errorText}</>
        </TradeFormBlankButton>
      )
    }

    return (
      <TradeFormBlankButton disabled={true}>
        <Trans>Unknown quote error</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.QuoteExpired]: {
    text: <Trans>Quote expired. Refreshing...</Trans>,
  },
  [TradeFormValidation.WalletNotConnected]: (context) => {
    return (
      <TradeFormBlankButton onClick={context.connectWallet} disabled={context.widgetStandaloneMode === false}>
        <Trans>Connect Wallet</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.WalletNotSupported]: {
    text: <Trans>Wallet Unsupported</Trans>,
  },
  [TradeFormValidation.NetworkNotSupported]: {
    text: <Trans>Unsupported Network</Trans>,
  },
  [TradeFormValidation.SafeReadonlyUser]: {
    text: (
      <>
        <span>
          <Trans>Connect signer</Trans>
        </span>{' '}
        <HelpTooltip
          text={
            <div>
              <Trans>
                Your Safe is not connected with a signer.
                <br />
                To place an order, you must connect using a signer of this Safe.
              </Trans>
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
    text: <Trans>Couldn't load balances</Trans>,
  },
  [TradeFormValidation.BalanceInsufficient]: (context) => {
    const inputCurrency = context.derivedState.inputCurrency

    return (
      <TradeFormBlankButton disabled={true}>
        <span>
          <Trans>Insufficient {<TokenSymbol token={inputCurrency} />} balance</Trans>
        </span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveAndSwapInBundle]: (context, isDisabled = false) => {
    const inputCurrency = context.derivedState.inputCurrency
    const tokenToApprove = inputCurrency && getWrappedToken(inputCurrency)
    const contextDefaultText = context.defaultText

    return (
      <TradeFormBlankButton disabled={isDisabled} onClick={context.confirmTrade}>
        <span>
          <Trans>
            Approve {<TokenSymbol token={tokenToApprove} length={6} />} and {contextDefaultText}
          </Trans>
        </span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveRequired]: (context) => {
    const { amountToApprove, enablePartialApprove, defaultText } = context
    if (!amountToApprove) return null

    const label = enablePartialApprove ? t`Approve and ${defaultText}` : defaultText

    return (
      <TradeApproveButton
        amountToApprove={amountToApprove}
        enablePartialApprove={enablePartialApprove}
        confirmSwap={context.confirmTrade}
        label={label}
      >
        <TradeFormBlankButton disabled={!enablePartialApprove}>{label}</TradeFormBlankButton>
      </TradeApproveButton>
    )
  },
  [TradeFormValidation.SellNativeToken]: (context) => {
    const inputCurrency = context.derivedState.inputCurrency
    const isNativeIn = !!inputCurrency && getIsNativeToken(inputCurrency)
    const symbol = inputCurrency?.symbol

    if (!isNativeIn) return null

    return (
      <TradeFormBlankButton disabled>
        <Trans>Selling {symbol} is not supported</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ImportingIntermediateToken]: {
    text: <Trans>Import intermediate token</Trans>,
  },
  [TradeFormValidation.ProxyAccountLoading]: {
    text: <ProxyAccountLoading />,
  },
  [TradeFormValidation.ProxyAccountUnknown]: {
    text: <ProxyAccountUnknown />,
  },
}
