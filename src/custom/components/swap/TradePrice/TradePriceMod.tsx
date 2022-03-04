// import { Trans } from '@lingui/macro'
import { Currency, Price } from '@uniswap/sdk-core'
// import useUSDCPrice from '@src/hooks/useUSDCPrice'
import { useCallback, useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
// import { ThemedText } from 'theme'
import { formatMax, formatSmart } from 'utils/format' // mod
import { LightGreyText } from 'pages/Swap'

export interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  fiatValue?: string // mod
  setShowInverted: (showInverted: boolean) => void
}

const StyledPriceContainer = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: grid;
  height: 24px;
  justify-content: center;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
`

export default function TradePrice({ price, showInverted, fiatValue, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  // const usdcPrice = useUSDCPrice(showInverted ? price.baseCurrency : price.quoteCurrency)

  let formattedPrice: string
  try {
    // formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
    formattedPrice = showInverted ? formatSmart(price) ?? 'N/A' : formatSmart(price.invert()) ?? 'N/A'
  } catch (error) {
    formattedPrice = 'N/A'
  }

  const fullFormattedPrice = formatMax(showInverted ? price : price?.invert()) || '-'

  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  // const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`
  const baseText = '1 ' + labelInverted + ' = '
  const quoteText = (formattedPrice ?? '-') + ' ' + label
  const fiatText = ` (≈$${fiatValue})`

  return (
    <StyledPriceContainer onClick={flipPrice}>
      <Text fontWeight={500} fontSize={14} color={theme.text1}>
        {/* {text} */}
        <LightGreyText>{baseText}</LightGreyText>
        <span title={`${fullFormattedPrice} ${label}`}>{quoteText}</span>
        {fiatValue && <LightGreyText>{fiatText}</LightGreyText>}
      </Text>{' '}
      {/* {usdcPrice && (
        <ThemedText.DarkGray>
          <Trans>(${usdcPrice.toSignificant(6, { groupSeparator: ',' })})</Trans>
        </ThemedText.DarkGray>
      )} */}
    </StyledPriceContainer>
  )
}
