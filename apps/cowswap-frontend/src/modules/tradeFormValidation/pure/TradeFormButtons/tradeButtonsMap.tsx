import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { getIsNativeToken, getWrappedToken } from '@cowprotocol/common-utils'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { CenteredDots, HelpTooltip, TokenSymbol } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { TradeApproveButton } from 'modules/erc20Approve'

import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { ProxyAccountLoading, ProxyAccountUnknown } from './common'

import { XSTOCK_MIN_TRADE_SIZE_USD } from '../../consts'
import { TradeFormButtonContext, TradeFormValidation } from '../../types'
import { QuoteErrorsButton } from '../QuoteErrorsButton/QuoteErrorsButton.pure'
import { TradeFormBlankButton } from '../TradeFormBlankButton'
import { UnsupportedTokenButton } from '../UnsupportedTokenButton.pure'

type ButtonComponent = React.ComponentType<ButtonComponentProps>

type ButtonComponentProps = TradeFormButtonContext & { isDisabled?: boolean }

interface ButtonErrorConfig {
  text: ReactNode
  id?: string
}

export const tradeButtonsMap: Record<TradeFormValidation, ButtonErrorConfig | ButtonComponent> = {
  [TradeFormValidation.WrapUnwrapFlow]: (props: ButtonComponentProps) => {
    const isNativeIn = !!props.derivedState.inputCurrency && getIsNativeToken(props.derivedState.inputCurrency)

    return (
      <TradeFormBlankButton onClick={() => props.wrapNativeFlow()}>
        {isNativeIn ? t`Wrap` : t`Unwrap`}
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.CustomTokenError]: ({ customTokenError }: ButtonComponentProps) => {
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
  [TradeFormValidation.XstockMinimumTradeSize]: {
    text: <Trans>Minimum trade size for xStocks tokens is ${XSTOCK_MIN_TRADE_SIZE_USD}</Trans>,
  },
  [TradeFormValidation.BrowserOffline]: {
    text: <Trans>Error loading price. You are currently offline.</Trans>,
  },
  [TradeFormValidation.RecipientNotConfirmed]: {
    text: <Trans>Confirm recipient to swap</Trans>,
  },
  [TradeFormValidation.RecipientNotSet]: ({ derivedState: { outputCurrency } }: ButtonComponentProps) => {
    const chainLabel = outputCurrency ? getChainInfo(outputCurrency.chainId)?.label : undefined

    return (
      <TradeFormBlankButton disabled>
        <Trans>Recipient is required for {chainLabel}</Trans>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.RecipientInvalid]: ({
    derivedState: { inputCurrency, outputCurrency, recipient },
  }: ButtonComponentProps) => {
    const isBridging = inputCurrency && outputCurrency && inputCurrency.chainId !== outputCurrency.chainId
    const isNonEvmBridging = isBridging && outputCurrency && !isEvmChain(outputCurrency.chainId)
    const showEnsTooltip = isBridging && recipient && !isNonEvmBridging

    return (
      <TradeFormBlankButton disabled>
        <>
          <Trans>Enter a valid recipient</Trans>
          {showEnsTooltip && (
            <HelpTooltip
              placement="top"
              text={t`ENS recipient not supported for Swap and Bridge. Use address instead.`}
            />
          )}
        </>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.CurrencyNotSupported]: (props: ButtonComponentProps) => {
    return <UnsupportedTokenButton {...props} />
  },
  [TradeFormValidation.QuoteErrors]: (props: ButtonComponentProps) => {
    return <QuoteErrorsButton {...props} />
  },
  [TradeFormValidation.QuoteExpired]: {
    text: <Trans>Quote expired. Refreshing...</Trans>,
  },
  [TradeFormValidation.WalletNotConnected]: (props: ButtonComponentProps) => {
    return (
      <TradeFormBlankButton onClick={props.connectWallet} disabled={props.widgetStandaloneMode === false}>
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
  [TradeFormValidation.NetworkDeprecated]: {
    text: <Trans>Deprecated Network</Trans>,
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
  [TradeFormValidation.WalletCapabilitiesLoading]: {
    text: (
      <>
        <CenteredDots smaller />
      </>
    ),
  },
  [TradeFormValidation.QuoteLoading]: {
    text: <TradeLoadingButton />,
  },
  [TradeFormValidation.ImpactLoading]: {
    text: (
      <>
        <Trans>Fetching price impact</Trans>
        <CenteredDots smaller />
      </>
    ),
  },
  [TradeFormValidation.BalancesLoading]: {
    text: (
      <>
        <Trans>Fetching balances</Trans>
        <CenteredDots smaller />
      </>
    ),
  },
  [TradeFormValidation.BalancesNotLoaded]: (props: ButtonComponentProps) => {
    let errorMessage: string | undefined = undefined

    if (props.balancesError?.includes('rate limit')) {
      errorMessage = t`Request is being rate limited`
    }

    return (
      <TradeFormBlankButton disabled={true}>
        <>
          <Trans>Couldn't load balances</Trans>
          {errorMessage ? <HelpTooltip text={<div>{errorMessage}</div>} /> : null}
        </>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.BalanceInsufficient]: (props: ButtonComponentProps) => {
    const inputCurrency = props.derivedState.inputCurrency

    return (
      <TradeFormBlankButton disabled={true}>
        <span>
          <Trans>Insufficient {<TokenSymbol token={inputCurrency} />} balance</Trans>
        </span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveAndSwapInBundle]: ({ isDisabled = false, ...context }: ButtonComponentProps) => {
    const inputCurrency = context.derivedState.inputCurrency
    const tokenToApprove = inputCurrency && getWrappedToken(inputCurrency)
    const contextDefaultText = context.defaultText

    return (
      <TradeFormBlankButton disabled={isDisabled} onClick={context.confirmTrade} clickEvent={context.approveClickEvent}>
        <span>
          <Trans>
            Approve {<TokenSymbol token={tokenToApprove} length={6} />} and {contextDefaultText}
          </Trans>
        </span>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.ApproveRequired]: ({ isDisabled = false, ...context }: ButtonComponentProps) => {
    const { amountToApprove, supportsPartialApprove, defaultText } = context
    if (!amountToApprove) return null

    return (
      <TradeApproveButton
        isDisabled={isDisabled}
        amountToApprove={amountToApprove}
        supportsPartialApprove={supportsPartialApprove}
        onApproveConfirm={context.confirmTrade}
        minAmountToSignForSwap={context.minAmountToSignForSwap}
        approveClickEvent={context.approveClickEvent}
        swapClickEvent={context.confirmClickEvent}
      >
        <TradeFormBlankButton disabled={!supportsPartialApprove}>{defaultText}</TradeFormBlankButton>
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
  [TradeFormValidation.RestrictedForCountry]: {
    text: <Trans>This token is not available in your region</Trans>,
  },
  [TradeFormValidation.DisableTradeWithUnknownPriceImpact]: () => {
    return (
      <TradeFormBlankButton disabled>
        <>
          <Trans>Unknown price impact</Trans>
          <HelpTooltip
            placement="top"
            text={t`Not enough price data for one or both assets to calculate the price impact`}
          />
        </>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.DisableTradeWithHighPriceImpact]: ({ widgetPriceImpactThreshold = 0 }) => {
    return (
      <TradeFormBlankButton disabled>
        <>
          <Trans>Price impact is too high</Trans>
          <HelpTooltip
            placement="top"
            text={t`Trading is not allowed with price impact higher than ${widgetPriceImpactThreshold}%`}
          />
        </>
      </TradeFormBlankButton>
    )
  },
  [TradeFormValidation.WidgetConstrainedTokenPair]: {
    text: <Trans>The token pair is constrained</Trans>,
  },
}
