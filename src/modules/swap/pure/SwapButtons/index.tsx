import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import React, { ReactNode } from 'react'
import { ButtonSize } from 'theme/enum'
import { Trans } from '@lingui/macro'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { AutoRow } from 'components/Row'
import { GreyCard } from 'components/Card'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AutoColumn } from 'components/Column'
import * as styledEl from './styled'
import { WrapUnwrapCallback } from 'hooks/useWrapCallback'
import { EthFlowBanner } from 'modules/swap/containers/EthFlow/EthFlowBanner'
import { Field } from 'state/swap/actions'
import { TradeApproveButton } from 'common/containers/TradeApprove/TradeApproveButton'
import { genericPropsChecker } from 'utils/genericPropsChecker'
import { TokenSymbol } from 'common/pure/TokenSymbol'

export type HandleSwapCallback = () => void

export interface SwapButtonsContext {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: HandleSwapCallback
  inputAmount: CurrencyAmount<Currency> | undefined
  wrapUnwrapAmount: CurrencyAmount<Currency> | undefined
  wrapInputError: string | undefined
  onWrapOrUnwrap: WrapUnwrapCallback | null
  onEthFlow: () => void
  openSwapConfirm: () => void
  toggleWalletModal: () => void
  hasEnoughWrappedBalanceForSwap: boolean
  swapInputError?: ReactNode
  onCurrencySelection: (field: Field, currency: Currency) => void
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
  [SwapButtonState.WrapError]: (props: SwapButtonsContext) => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      {props.wrapInputError}
    </ButtonPrimary>
  ),
  [SwapButtonState.ShouldWrapNativeToken]: (props: SwapButtonsContext) => (
    <ButtonPrimary onClick={() => props.onWrapOrUnwrap?.()} buttonSize={ButtonSize.BIG}>
      <Trans>Wrap</Trans>
    </ButtonPrimary>
  ),
  [SwapButtonState.ShouldUnwrapNativeToken]: (props: SwapButtonsContext) => (
    <ButtonPrimary onClick={() => props.onWrapOrUnwrap?.()} buttonSize={ButtonSize.BIG}>
      <Trans>Unwrap</Trans>
    </ButtonPrimary>
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
    <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={props.toggleWalletModal}>
      <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
    </ButtonPrimary>
  ),
  [SwapButtonState.ReadonlyGnosisSafeUser]: () => (
    <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
      <Trans>Read Only</Trans>
    </ButtonPrimary>
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
  [SwapButtonState.ExpertModeSwap]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.handleSwap}>
      <styledEl.SwapButtonBox>
        <Trans>Swap</Trans>
      </styledEl.SwapButtonBox>
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
          Approve&nbsp;{<TokenSymbol token={props.inputAmount?.currency.wrapped} length={6} />}&nbsp;and Swap
        </Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.ExpertApproveAndSwap]: (props: SwapButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.handleSwap}>
      <styledEl.SwapButtonBox>
        <Trans>
          Confirm (Approve&nbsp;{<TokenSymbol token={props.inputAmount?.currency.wrapped} length={6} />}&nbsp;and Swap)
        </Trans>
      </styledEl.SwapButtonBox>
    </ButtonError>
  ),
  [SwapButtonState.RegularEthFlowSwap]: (props: SwapButtonsContext) => (
    <EthFlowSwapButton isExpertMode={false} {...props} />
  ),
  [SwapButtonState.ExpertModeEthFlowSwap]: (props: SwapButtonsContext) => (
    <EthFlowSwapButton isExpertMode={true} {...props} />
  ),
}

function EthFlowSwapButton(props: SwapButtonsContext & { isExpertMode: boolean }) {
  return (
    <>
      <ButtonError buttonSize={ButtonSize.BIG} onClick={props.isExpertMode ? props.handleSwap : props.openSwapConfirm}>
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
  console.debug('RENDER SWAP BUTTON: ', props)

  return <div id="swap-button">{swapButtonStateMap[props.swapButtonState](props)}</div>
}, genericPropsChecker)
