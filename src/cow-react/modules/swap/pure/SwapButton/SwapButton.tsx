import { SwapButtonState } from 'cow-react/modules/swap/helpers/getSwapButtonState'
import React, { ReactNode } from 'react'
import { ButtonSize } from 'theme'
import { Trans } from '@lingui/macro'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AutoRow } from 'components/Row'
import { GreyCard } from 'components/Card'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { AutoColumn } from 'components/Column'
import { ApproveButton, ApproveButtonProps } from '@src/cow-react/modules/swap/containers/ApproveErrorButtons'
import * as styledEl from './styled'
import { HandleSwapCallback } from 'cow-react/modules/swap/hooks/useHandleSwap'
import { isSwapButtonPropsEqual } from 'cow-react/modules/swap/containers/NewSwapWidget/propsChecker'

export interface SwapButtonContext {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: HandleSwapCallback
  approveButtonProps: ApproveButtonProps
  wrapUnwrapAmount: CurrencyAmount<Currency> | undefined
  wrapInputError: string | undefined
  onWrap: () => void
  openSwapConfirm: () => void
  toggleWalletModal: () => void
  hasEnoughWrappedBalanceForSwap: boolean
  swapInputError?: ReactNode
}

const swapButtonStateMap: { [key in SwapButtonState]: (props: SwapButtonContext) => JSX.Element } = {
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
  [SwapButtonState.WrapError]: (props: SwapButtonContext) => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      {props.wrapInputError}
    </ButtonPrimary>
  ),
  [SwapButtonState.ShouldWrapNativeToken]: (props: SwapButtonContext) => (
    <ButtonPrimary onClick={props.onWrap} buttonSize={ButtonSize.BIG}>
      <Trans>Wrap</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.ShouldUnwrapNativeToken]: (props: SwapButtonContext) => (
    <ButtonPrimary onClick={props.onWrap} buttonSize={ButtonSize.BIG}>
      <Trans>Unwrap</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.SwapWithWrappedToken]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onWrap}>
      <styledEl.SwapButtonBox>
        <Trans>Swap with {props.wrappedToken.symbol}</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.WrapAndSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onWrap}>
      <styledEl.SwapButtonBox>
        <Trans>Wrap and swap</Trans>
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
  [SwapButtonState.TransferToSmartContract]: (props: SwapButtonContext) => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>
        Buying {GpEther.onChain(props.chainId || SupportedChainId.MAINNET).symbol} with smart contract wallets is not
        currently supported
      </Trans>
    </GreyCard>
  ),
  [SwapButtonState.FetchQuoteError]: () => (
    <GreyCard style={{ textAlign: 'center' }}>
      <Trans>Error loading price. Try again later.</Trans>
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
  [SwapButtonState.WalletIsNotConnected]: (props: SwapButtonContext) => (
    <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={props.toggleWalletModal}>
      <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.ReadonlyGnosisSafeUser]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <Trans>Read Only</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.NeedApprove]: (props: SwapButtonContext) => (
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
  [SwapButtonState.SwapDisabled]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError || <Trans>Swap</Trans>}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.SwapError]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
      <styledEl.SwapButtonBox>{props.swapInputError}</styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.ExpertModeSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.handleSwap}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.RegularSwap]: (props: SwapButtonContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
}

export const SwapButton = React.memo(function (props: SwapButtonContext) {
  console.debug('RENDER SWAP BUTTON: ', props)

  return <div id="swap-button">{swapButtonStateMap[props.swapButtonState](props)}</div>
}, isSwapButtonPropsEqual)
