import { ReactElement, ReactNode } from 'react'

import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { BridgeProviderQuoteError, BridgeQuoteErrors } from '@cowprotocol/cow-sdk'
import { CenteredDots, HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { CompatibilityIssuesWarning } from 'modules/trade'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { TradeApproveButton } from 'common/containers/TradeApprove'
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

const DEFAULT_QUOTE_ERROR = 'Error loading price. Try again later.'

const errorTooltipContent: Partial<Record<QuoteApiErrorCodes, string>> = {
  [QuoteApiErrorCodes.SameBuyAndSellToken]: 'Right now, SWAP is required for any bridging. Just Swap will come soon.',
}

const quoteErrorTexts: Record<QuoteApiErrorCodes, string> = {
  [QuoteApiErrorCodes.UNHANDLED_ERROR]: DEFAULT_QUOTE_ERROR,
  [QuoteApiErrorCodes.TransferEthToContract]:
    'Buying native currency with smart contract wallets is not currently supported',
  [QuoteApiErrorCodes.UnsupportedToken]: 'Unsupported token',
  [QuoteApiErrorCodes.InsufficientLiquidity]: 'Insufficient liquidity for this trade.',
  [QuoteApiErrorCodes.FeeExceedsFrom]: 'Sell amount is too small',
  [QuoteApiErrorCodes.ZeroPrice]: 'Invalid price. Try increasing input/output amount.',
  [QuoteApiErrorCodes.SameBuyAndSellToken]: 'Not yet supported',
}

const bridgeQuoteErrorTexts: Record<BridgeQuoteErrors, string> = {
  [BridgeQuoteErrors.API_ERROR]: DEFAULT_QUOTE_ERROR,
  [BridgeQuoteErrors.INVALID_BRIDGE]: DEFAULT_QUOTE_ERROR,
  [BridgeQuoteErrors.TX_BUILD_ERROR]: DEFAULT_QUOTE_ERROR,
  [BridgeQuoteErrors.QUOTE_ERROR]: DEFAULT_QUOTE_ERROR,
  [BridgeQuoteErrors.INVALID_API_JSON_RESPONSE]: DEFAULT_QUOTE_ERROR,
  [BridgeQuoteErrors.NO_INTERMEDIATE_TOKENS]: 'No routes found',
  [BridgeQuoteErrors.NO_ROUTES]: 'No routes found',
  [BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED]: 'Only "sell" orders are supported',
}

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

    if (quote.error instanceof QuoteApiError) {
      if (quote.error.type === QuoteApiErrorCodes.UnsupportedToken) {
        return unsupportedTokenButton(context)
      }

      const errorText = quoteErrorTexts[quote.error.type] || DEFAULT_QUOTE_ERROR

      const errorTooltip = errorTooltipContent[quote.error.type] || <></>

      return (
        <TradeFormBlankButton disabled={true}>
          <>
            <Trans>{errorText}</Trans>
            {errorTooltip && <HelpTooltip text={errorTooltip} />}
          </>
        </TradeFormBlankButton>
      )
    }

    if (quote.error instanceof BridgeProviderQuoteError) {
      const errorMessage = quote.error.message as BridgeQuoteErrors
      const errorText = bridgeQuoteErrorTexts[errorMessage] || DEFAULT_QUOTE_ERROR

      return (
        <TradeFormBlankButton disabled={true}>
          <>
            <Trans>{errorText}</Trans>
          </>
        </TradeFormBlankButton>
      )
    }

    return (
      <TradeFormBlankButton disabled={true}>
        <Trans>Unknown quote error</Trans>
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
        <span>
          <Trans>Insufficient {<TokenSymbol token={inputCurrency} />} balance</Trans>
        </span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveAndSwap]: (context, isDisabled = false) => {
    const inputCurrency = context.derivedState.inputCurrency
    const tokenToApprove = inputCurrency && getWrappedToken(inputCurrency)

    return (
      <TradeFormBlankButton disabled={isDisabled} onClick={context.confirmTrade}>
        <span>
          <Trans>
            Approve {<TokenSymbol token={tokenToApprove} length={6} />} and {context.defaultText}
          </Trans>
        </span>
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
  [TradeFormValidation.ImportingIntermediateToken]: {
    text: 'Import intermediate token',
  },
  [TradeFormValidation.ProxyAccountLoading]: {
    text: (
      <>
        <span>Loading account proxy</span>
        <CenteredDots smaller />
      </>
    ),
  },
  [TradeFormValidation.ProxyAccountUnknown]: {
    text: "Couldn't verify account proxy, please try later",
  },
}
