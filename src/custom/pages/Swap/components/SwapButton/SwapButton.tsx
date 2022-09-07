import { SwapButtonState } from 'pages/Swap/helpers/getSwapButtonState'
import React, { ReactNode } from 'react'
import { ThemedText, ButtonSize } from 'theme'
import { Trans } from '@lingui/macro'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AutoRow } from 'components/Row'
import { GreyCard } from 'components/Card'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { AutoColumn } from 'components/Column'
import { ApproveButton, ApproveButtonProps } from 'pages/Swap/components/ApproveButton'
import * as styledEl from './styled'
import { HandleSwapCallback } from 'pages/Swap/hooks/useHandleSwap'
import { isSwapButtonPropsEqual } from 'pages/NewSwap/propsChecker'

export interface SwapButtonContext {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: HandleSwapCallback
  approveButtonProps: ApproveButtonProps
  wrapUnrapAmount: CurrencyAmount<Currency> | undefined
  wrapInputError: string | undefined
  onWrap: () => void
  openSwapConfirm: () => void
  toggleWalletModal: () => void
  swapInputError?: ReactNode
}

const swapButtonStateMap: { [key in SwapButtonState]: (props: SwapButtonContext) => JSX.Element } = {
  [SwapButtonState.swapIsUnsupported]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <ThemedText.Main mb="4px">
        <Trans>Unsupported Token</Trans>
      </ThemedText.Main>
    </ButtonPrimary>
  ),
  [SwapButtonState.walletIsUnsupported]: () => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <Text fontSize={20} fontWeight={500}>
        <Trans>Wallet Unsupported</Trans>
      </Text>
    </ButtonError>
  ),
  [SwapButtonState.wrapError]: (props: SwapButtonContext) => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      {props.wrapInputError}
    </ButtonPrimary>
  ),
  [SwapButtonState.shouldWrapNativeToken]: (props: SwapButtonContext) => (
    <ButtonPrimary onClick={props.onWrap} buttonSize={ButtonSize.BIG}>
      <Trans>Wrap</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.shouldUnwrapNativeToken]: (props: SwapButtonContext) => (
    <ButtonPrimary onClick={props.onWrap} buttonSize={ButtonSize.BIG}>
      <Trans>Unwrap</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.swapWithWrappedToken]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onWrap}>
      <styledEl.SwapButtonBox>
        <Trans>Swap with {props.wrappedToken.symbol}</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.wrapAndSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onWrap}>
      <styledEl.SwapButtonBox>
        <Trans>Wrap and swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.feesExceedFromAmount]: () => <styledEl.FeesExceedFromAmountMessage />,
  [SwapButtonState.insufficientLiquidity]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <ThemedText.Main mb="4px">
        <Trans>Insufficient liquidity for this trade.</Trans>
      </ThemedText.Main>
    </GreyCard>
  ),
  [SwapButtonState.zeroPrice]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <ThemedText.Main mb="4px">
        <Trans>Invalid price. Try increasing input/output amount.</Trans>
      </ThemedText.Main>
    </GreyCard>
  ),
  [SwapButtonState.transferToSmartContract]: (props: SwapButtonContext) => (
    <GreyCard style={{ textAlign: 'center' }}>
      <ThemedText.Main mb="4px">
        <Trans>
          Buying {GpEther.onChain(props.chainId || SupportedChainId.MAINNET).symbol} with smart contract wallets is not
          currently supported
        </Trans>
      </ThemedText.Main>
    </GreyCard>
  ),
  [SwapButtonState.fetchQuoteError]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <ThemedText.Main mb="4px">
        <Trans>Error loading price. Try again later.</Trans>
      </ThemedText.Main>
    </GreyCard>
  ),
  [SwapButtonState.offlineBrowser]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <ThemedText.Main mb="4px">Error loading price. You are currently offline.</ThemedText.Main>
    </GreyCard>
  ),
  [SwapButtonState.loading]: () => (
    <ButtonPrimary buttonSize={ButtonSize.BIG}>
      <styledEl.SwapButtonBox showLoading={true}></styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.walletIsNotConnected]: (props: SwapButtonContext) => (
    <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={props.toggleWalletModal}>
      <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.readonlyGnosisSafeUser]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <ThemedText.Main mb="4px">
        <Trans>Read Only</Trans>
      </ThemedText.Main>
    </ButtonPrimary>
  ),
  [SwapButtonState.needApprove]: (props: SwapButtonContext) => (
    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
      <AutoColumn style={{ width: '100%' }} gap="12px">
        <ApproveButton {...props.approveButtonProps}>
          <styledEl.SwapButtonBox>
            <Trans>Swap</Trans>
          </styledEl.SwapButtonBox>
        </ApproveButton>
      </AutoColumn>
    </AutoRow>
  ),
  [SwapButtonState.swapDisabled]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError || <Trans>Swap</Trans>}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.swapError]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.expertModeSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.handleSwap}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.regularSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
}

export const SwapButton = React.memo(function (props: SwapButtonContext) {
  console.log('RENDER SWAP BUTTON: ', props)

  return <div id="swap-button">{swapButtonStateMap[props.swapButtonState](props)}</div>
}, isSwapButtonPropsEqual)
