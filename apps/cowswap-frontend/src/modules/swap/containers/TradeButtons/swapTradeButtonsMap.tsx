import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonError, ButtonSize, TokenSymbol } from '@cowprotocol/ui'
import { Currency, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { EthFlowBanner } from 'modules/ethFlow'

import { SwapFormState } from '../../hooks/useSwapFormState'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export interface SwapTradeButtonsContext {
  wrappedToken: Token
  inputCurrency: Currency | null
  onEthFlow: Command
  openSwapConfirm: Command
  hasEnoughWrappedBalanceForSwap: boolean
  onCurrencySelection: (field: Field, currency: Currency) => void
  confirmText: string
}

type SwapTradeButton = (props: SwapTradeButtonsContext, isDisabled: boolean) => ReactNode | string

export const swapTradeButtonsMap: Record<SwapFormState, SwapTradeButton> = {
  [SwapFormState.SwapWithWrappedToken]: (props: SwapTradeButtonsContext, isDisabled: boolean) => {
    return (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onEthFlow} disabled={isDisabled}>
        <div>
          <Trans>Swap with</Trans> {props.wrappedToken.symbol}
        </div>
      </ButtonError>
    )
  },
  [SwapFormState.WrapAndSwap]: (props: SwapTradeButtonsContext, isDisabled: boolean) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm} disabled={isDisabled}>
      <div>
        <Trans>
          Wrap <TokenSymbol token={props.inputCurrency} length={6} /> and Swap
        </Trans>
      </div>
    </ButtonError>
  ),
  [SwapFormState.RegularEthFlowSwap]: (props: SwapTradeButtonsContext, isDisabled: boolean) => (
    <Wrapper>
      <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm} disabled={isDisabled}>
        <div>{props.confirmText}</div>
      </ButtonError>
      <EthFlowBanner
        hasEnoughWrappedBalance={props.hasEnoughWrappedBalanceForSwap}
        switchCurrencyCallback={() => props.onCurrencySelection(Field.INPUT, props.wrappedToken)}
        wrapCallback={props.onEthFlow}
      />
    </Wrapper>
  ),
  [SwapFormState.SellNativeInHooks]: (props: SwapTradeButtonsContext) => {
    const currency = props.inputCurrency
    const symbol = currency?.symbol

    return (
      <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
        <div>
          <Trans>Selling {symbol} is not supported</Trans>
        </div>
      </ButtonError>
    )
  },
}
