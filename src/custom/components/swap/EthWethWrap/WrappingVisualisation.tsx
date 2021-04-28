import React from 'react'
import { ArrowRight } from 'react-feather'
import { CurrencyAmount, Currency } from '@uniswap/sdk'
import { WrapCardContainer, WrapCard } from './WrapCard'

import { colors } from 'theme'

const COLOUR_SHEET = colors(false)

const WrappingVisualisation = ({
  nativeSymbol,
  nativeBalance,
  native,
  wrapped,
  wrappedBalance,
  wrappedSymbol,
  userInput
}: {
  nativeSymbol: string
  nativeBalance: CurrencyAmount | undefined
  native: Currency
  userInput: CurrencyAmount | undefined
  wrappedBalance: CurrencyAmount | undefined
  wrappedSymbol: string
  wrapped: Currency
}) => (
  <WrapCardContainer>
    {/* To Wrap */}
    <WrapCard symbol={nativeSymbol} balance={nativeBalance} currency={native} amountToWrap={userInput} />

    <ArrowRight size={18} color={COLOUR_SHEET.primary1} />

    {/* Wrap Outcome */}
    <WrapCard symbol={wrappedSymbol} balance={wrappedBalance} currency={wrapped} amountToWrap={userInput} />
  </WrapCardContainer>
)

export default WrappingVisualisation
