import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonError, ButtonSize, TokenSymbol } from '@cowprotocol/ui'
import { Currency, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { EthFlowBanner } from 'modules/ethFlow'

import { SwapFormState } from '../../hooks/useSwapFormState'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

interface SwapTradeButtonsContext {
  wrappedToken: Token
  inputCurrency: Currency | null
  onEthFlow: Command
  openSwapConfirm: Command
  hasEnoughWrappedBalanceForSwap: boolean
  onCurrencySelection: (field: Field, currency: Currency) => void
}

type SwapTradeButton = (props: SwapTradeButtonsContext) => ReactNode | string

export const swapTradeButtonsMap: Record<SwapFormState, SwapTradeButton> = {
  [SwapFormState.SwapWithWrappedToken]: (props: SwapTradeButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.onEthFlow}>
      <div>
        <Trans>Swap with {props.wrappedToken.symbol}</Trans>
      </div>
    </ButtonError>
  ),
  [SwapFormState.WrapAndSwap]: (props: SwapTradeButtonsContext) => (
    <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
      <div>
        <Trans>Wrap&nbsp;{<TokenSymbol token={props.inputCurrency} length={6} />}&nbsp;and Swap</Trans>
      </div>
    </ButtonError>
  ),
  [SwapFormState.RegularEthFlowSwap]: (props: SwapTradeButtonsContext) => (
    <Wrapper>
      <ButtonError buttonSize={ButtonSize.BIG} onClick={props.openSwapConfirm}>
        <div>
          <Trans>Swap</Trans>
        </div>
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

    return (
      <ButtonError buttonSize={ButtonSize.BIG} disabled={true}>
        <div>
          <Trans>Selling {currency?.symbol} is not supported</Trans>
        </div>
      </ButtonError>
    )
  },
}
