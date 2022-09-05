import { SwapButtonState } from 'pages/Swap/helpers/getSwapButtonState'
import React, { ReactNode } from 'react'
import { ThemedText, ButtonSize } from 'theme'
import { Trans } from '@lingui/macro'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { Token } from '@uniswap/sdk-core'
import { AutoRow } from 'components/Row'
import { GreyCard } from 'components/Card'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { AutoColumn } from 'components/Column'
import { ApproveButton, ApproveButtonProps } from 'pages/Swap/components/ApproveButton'
import * as styledEl from './styled'
import { HandleSwapCallback } from 'pages/Swap/hooks/useHandleSwap'

export interface SwapButtonProps {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: HandleSwapCallback
  approveButtonProps: ApproveButtonProps
  wrapInputError: string | undefined
  onWrap: () => void
  openSwapConfirm: () => void
  onSwap: () => void
  toggleWalletModal: () => void
  swapInputError?: ReactNode
}

export const SwapButton: React.FC<SwapButtonProps> = (props: SwapButtonProps) => {
  const {
    swapButtonState,
    chainId,
    onWrap,
    wrappedToken,
    approveButtonProps,
    swapInputError,
    wrapInputError,
    openSwapConfirm,
    onSwap,
    toggleWalletModal,
  } = props

  const map: { [key in SwapButtonState]: JSX.Element } = {
    [SwapButtonState.swapIsUnsupported]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        <ThemedText.Main mb="4px">
          <Trans>Unsupported Token</Trans>
        </ThemedText.Main>
      </ButtonPrimary>
    ),
    [SwapButtonState.walletIsUnsupported]: (
      <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
        <Text fontSize={20} fontWeight={500}>
          <Trans>Wallet Unsupported</Trans>
        </Text>
      </ButtonError>
    ),
    [SwapButtonState.wrapError]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        {wrapInputError}
      </ButtonPrimary>
    ),
    [SwapButtonState.shouldWrapNativeToken]: (
      <ButtonPrimary onClick={onWrap} buttonSize={ButtonSize.BIG}>
        <Trans>Wrap</Trans>
      </ButtonPrimary>
    ),
    [SwapButtonState.shouldUnwrapNativeToken]: (
      <ButtonPrimary onClick={onWrap} buttonSize={ButtonSize.BIG}>
        <Trans>Unwrap</Trans>
      </ButtonPrimary>
    ),
    [SwapButtonState.swapWithWrappedToken]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={onWrap}>
        <styledEl.SwapButtonBox>
          <Trans>Swap with {wrappedToken.symbol}</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.wrapAndSwap]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={onWrap}>
        <styledEl.SwapButtonBox>
          <Trans>Wrap and swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.feesExceedFromAmount]: <styledEl.FeesExceedFromAmountMessage />,
    [SwapButtonState.insufficientLiquidity]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Insufficient liquidity for this trade.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.zeroPrice]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Invalid price. Try increasing input/output amount.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.transferToSmartContract]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>
            Buying {GpEther.onChain(chainId || SupportedChainId.MAINNET).symbol} with smart contract wallets is not
            currently supported
          </Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.fetchQuoteError]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Error loading price. Try again later.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.offlineBrowser]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">Error loading price. You are currently offline.</ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.loading]: (
      <ButtonPrimary buttonSize={ButtonSize.BIG}>
        <styledEl.SwapButtonBox showLoading={true}></styledEl.SwapButtonBox>
      </ButtonPrimary>
    ),
    [SwapButtonState.walletIsNotConnected]: (
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={toggleWalletModal}>
        <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
      </ButtonPrimary>
    ),
    [SwapButtonState.readonlyGnosisSafeUser]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        <ThemedText.Main mb="4px">
          <Trans>Read Only</Trans>
        </ThemedText.Main>
      </ButtonPrimary>
    ),
    [SwapButtonState.needApprove]: (
      <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
        <AutoColumn style={{ width: '100%' }} gap="12px">
          <ApproveButton {...approveButtonProps}>
            <styledEl.SwapButtonBox>
              <Trans>Swap</Trans>
            </styledEl.SwapButtonBox>
          </ApproveButton>
        </AutoColumn>
      </AutoRow>
    ),
    [SwapButtonState.swapDisabled]: (
      <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
        <styledEl.SwapButtonBox>{swapInputError || <Trans>Swap</Trans>}</styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.swapError]: (
      <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
        <styledEl.SwapButtonBox>{swapInputError}</styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.expertModeSwap]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={onSwap}>
        <styledEl.SwapButtonBox>
          <Trans>Swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.regularSwap]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={openSwapConfirm}>
        <styledEl.SwapButtonBox>
          <Trans>Swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
  }

  return <div id="swap-button">{map[swapButtonState]}</div>
}
