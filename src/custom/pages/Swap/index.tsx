import React, { useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ThemeContext } from 'styled-components'
import { CurrencyAmount, Token } from '@uniswap/sdk'
import { Text } from 'rebass'

import { ButtonSize, TYPE } from 'theme/index'

import SwapMod from './SwapMod'
import { RowBetween, RowFixed } from 'components/Row'
import QuestionHelper from 'components/QuestionHelper'
import { ButtonError, ButtonPrimary } from 'components/Button'
import EthWethWrap, { Props as EthWethWrapProps } from 'components/swap/EthWethWrap'
import { useReplaceSwapState, useSwapState } from 'state/swap/hooks'

interface FeeGreaterMessageProp {
  fee: CurrencyAmount
}

export interface SwapProps extends RouteComponentProps {
  FeeGreaterMessage: React.FC<FeeGreaterMessageProp>
  EthWethWrapMessage: React.FC<EthWethWrapProps>
  SwitchToWethBtn: React.FC<SwitchToWethBtnProps>
  FeesExceedFromAmountMessage: React.FC
}

function FeeGreaterMessage({ fee }: FeeGreaterMessageProp) {
  const theme = useContext(ThemeContext)

  return (
    <RowBetween>
      <RowFixed>
        <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
          Fee
        </TYPE.black>
        <QuestionHelper text="GP Swap has 0 gas fees. A portion of the sell amount in each trade goes to the GP Protocol." />
      </RowFixed>
      <TYPE.black fontSize={14} color={theme.text1}>
        {fee.toSignificant(4)} {fee.currency.symbol}
      </TYPE.black>
    </RowBetween>
  )
}

function EthWethWrapMessage(props: EthWethWrapProps) {
  return (
    <RowBetween>
      <EthWethWrap {...props} />
    </RowBetween>
  )
}

interface SwitchToWethBtnProps {
  wrappedToken: Token
}

function SwitchToWethBtn({ wrappedToken }: SwitchToWethBtnProps) {
  const replaceSwapState = useReplaceSwapState()
  const { independentField, typedValue, OUTPUT } = useSwapState()

  return (
    <ButtonPrimary
      buttonSize={ButtonSize.BIG}
      id="swap-button"
      onClick={() =>
        replaceSwapState({
          inputCurrencyId: wrappedToken.address,
          outputCurrencyId: OUTPUT.currencyId,
          typedValue,
          recipient: null,
          field: independentField
        })
      }
    >
      <TYPE.main mb="4px">Switch to {wrappedToken.symbol}</TYPE.main>
    </ButtonPrimary>
  )
}

function FeesExceedFromAmountMessage() {
  return (
    <RowBetween>
      <ButtonError buttonSize={ButtonSize.BIG} error id="swap-button" disabled>
        <Text fontSize={20} fontWeight={500}>
          Fees exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}

export default function Swap(props: RouteComponentProps) {
  return (
    <SwapMod
      FeeGreaterMessage={FeeGreaterMessage}
      EthWethWrapMessage={EthWethWrapMessage}
      SwitchToWethBtn={SwitchToWethBtn}
      FeesExceedFromAmountMessage={FeesExceedFromAmountMessage}
      {...props}
    />
  )
}
