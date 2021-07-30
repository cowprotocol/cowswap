import React, { useCallback } from 'react'
import { Price, Currency } from '@uniswap/sdk-core'
import { useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { formatSmart } from 'utils/format' // mod
import { PRICE_FORMAT_OPTIONS } from 'constants/index' // mod
import { LightGreyText } from 'pages/Swap'

export interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  fiatValue?: string // mod
  setShowInverted: (showInverted: boolean) => void
}

export const StyledPriceContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 400;
  background-color: transparent;
  border: none;
  height: 24px;
  cursor: pointer;

  > div {
    display: flex;
    align-items: center;
    width: fit-content;
  }
`

export default function TradePrice({ price, showInverted, fiatValue, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  let formattedPrice: string
  try {
    // formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
    formattedPrice = showInverted
      ? formatSmart(price, ...PRICE_FORMAT_OPTIONS) ?? 'N/A'
      : formatSmart(price.invert(), ...PRICE_FORMAT_OPTIONS) ?? 'N/A'
  } catch (error) {
    formattedPrice = 'N/A'
  }

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  // const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`
  const baseText = '1 ' + labelInverted + ' = '
  const quoteText = (formattedPrice ?? '-') + ' ' + label
  const fiatText = ` (≈$${fiatValue})`

  return (
    <StyledPriceContainer onClick={flipPrice}>
      {/* <div style={{ alignItems: 'center', display: 'flex', width: 'fit-content' }}> */}
      <div>
        <Text fontWeight={500} fontSize={14} color={theme.text1}>
          {/* {text} */}
          <LightGreyText>{baseText}</LightGreyText>
          <strong>{quoteText}</strong>
          {fiatValue && <LightGreyText>{fiatText}</LightGreyText>}
        </Text>
      </div>
    </StyledPriceContainer>
  )
}
