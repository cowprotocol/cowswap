import React, { ReactNode } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { genericPropsChecker, getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { AutoRow, ButtonError, ButtonPrimary, ButtonSize, TokenSymbol } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Text } from 'rebass'

import { GreyCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'
import { WrapUnwrapCallback } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/types'

import { EthFlowBanner } from 'modules/swap/containers/EthFlow/EthFlowBanner'
import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { QuoteDeadlineParams } from 'modules/tradeQuote'

import { TradeApproveButton } from 'common/containers/TradeApprove/TradeApproveButton'

import { SafeReadOnlyButton } from './SafeReadOnlyButton'
import * as styledEl from './styled'

export type HandleSwapCallback = Command
export interface SwapButtonsContext {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: HandleSwapCallback
  inputAmount: CurrencyAmount<Currency> | undefined
  onWrapOrUnwrap: WrapUnwrapCallback | null
  onEthFlow: Command
  openSwapConfirm: Command
  toggleWalletModal: Command | null
  hasEnoughWrappedBalanceForSwap: boolean
  swapInputError?: ReactNode
  onCurrencySelection: (field: Field, currency: Currency) => void
  recipientAddressOrName: string | null
  widgetStandaloneMode?: boolean
  quoteDeadlineParams: QuoteDeadlineParams
}

const swapButtonStateMap: { [key in SwapButtonState]: (props: SwapButtonsContext) => JSX.Element } = {
  [SwapButtonState.SwapIsUnsupported]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <Trans>Unsupported Token</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.WalletIsUnsupported]: () => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <Text fontSize={20} fontWeight={500}>
        <Trans>Wallet Unsupported</Trans>
      </Text>
    </ButtonError>
  ),
  [SwapButtonState.SwapWithWrappedToken]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onEthFlow}>
      <styledEl.SwapButtonBox>
        <Trans>Swap with {props.wrappedToken.symbol}</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.FeesExceedFromAmount]: () => <styledEl.FeesExceedFromAmountMessage />,
  [SwapButtonState.InsufficientLiquidity]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Insufficient liquidity for this trade.</Trans>
    </GreyCard>
  ),
  [SwapButtonState.ZeroPrice]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Invalid price. Try increasing input/output amount.</Trans>
    </GreyCard>
  ),
  [SwapButtonState.TransferToSmartContract]: (props: SwapButtonsContext) => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>
        Buying {NATIVE_CURRENCIES[(props.chainId as SupportedChainId) || SupportedChainId.MAINNET].symbol} with smart
        contract wallets is not currently supported
      </Trans>
    </GreyCard>
  ),
  [SwapButtonState.FetchQuoteError]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Error loading price. Try again later.</Trans>
    </GreyCard>
  ),
  [SwapButtonState.QuoteExpired]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Quote expired. Refreshing...</Trans>
    </GreyCard>
  ),
  [SwapButtonState.UnsupportedToken]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Unsupported token</Trans>
    </GreyCard>
  ),
  [SwapButtonState.OfflineBrowser]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Error loading price. You are currently offline.</Trans>
    </GreyCard>
  ),
  [SwapButtonState.Loading]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <styledEl.SwapButtonBox showLoading={true}></styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.WalletIsNotConnected]: (props: SwapButtonsContext) => (
    <ButtonPrimary
      buttonSize={ButtonSize.BIG}
      onClick={props.toggleWalletModal || undefined}
      disabled={!props.toggleWalletModal || props.widgetStandaloneMode === false}
    >
      <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.ReadonlyGnosisSafeUser]: () => (
    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
      <AutoColumn style={{ width: '100%' }} gap="12px">
        <SafeReadOnlyButton />
      </AutoColumn>
    </AutoRow>
  ),
  [SwapButtonState.NeedApprove]: (props: SwapButtonsContext) => (
    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
      <AutoColumn style={{ width: '100%' }} gap="12px">
        {props.inputAmount && (
          <TradeApproveButton amountToApprove={props.inputAmount}>
            <ButtonError disabled={true} buttonSize={ButtonSize.BIG}>
              <styledEl.SwapButtonBox>
                <Trans>Swap</Trans>
              </styledEl.SwapButtonBox>
            </ButtonError>
          </TradeApproveButton>
        )}
      </AutoColumn>
    </AutoRow>
  ),
  [SwapButtonState.SwapDisabled]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError || <Trans>Swap</Trans>}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.SwapError]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.RegularSwap]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.ApproveAndSwap]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <styledEl.SwapButtonBox>
        <Trans>
          Approve{' '}
          <TokenSymbol token={props.inputAmount?.currency && getWrappedToken(props.inputAmount.currency)} length={6} />{' '}
          and Swap
        </Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.WrapAndSwap]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <styledEl.SwapButtonBox>
        <Trans>Wrap&nbsp;{<TokenSymbol token={props.inputAmount?.currency} length={6} />}&nbsp;and Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.RegularEthFlowSwap]: (props: SwapButtonsContext) => <EthFlowSwapButton {...props} />,
}

function EthFlowSwapButton(props: SwapButtonsContext) {
  return (
    <>
      <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
        <styledEl.SwapButtonBox>
          <Trans>Swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
      <EthFlowBanner
        hasEnoughWrappedBalance={props.hasEnoughWrappedBalanceForSwap}
        switchCurrencyCallback={() => props.onCurrencySelection(Field.INPUT, props.wrappedToken)}
        wrapCallback={props.onEthFlow}
      />
    </>
  )
}

export const SwapButtons = React.memo(function (props: SwapButtonsContext) {
  return <div id="swap-button">{swapButtonStateMap[props.swapButtonState](props)}</div>
}, genericPropsChecker)
