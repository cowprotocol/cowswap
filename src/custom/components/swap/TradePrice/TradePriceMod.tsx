// import { Trans } from '@lingui/macro'
import { Currency, Price } from '@uniswap/sdk-core'
// import useStablecoinPrice from '@src/hooks/useStablecoinPrice'
import { useCallback, useContext } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components/macro'
// import { ThemedText } from 'theme'

// MOD imports
import { formatMax, formatSmart } from 'utils/format' // mod
import { LightGreyText } from 'pages/Swap/styled'

export interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
  fiatValue?: string // mod
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
  /* display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  padding: 8px 0;
  user-select: text; */
`

export default function TradePrice({ price, showInverted, fiatValue, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)

  // const usdcPrice = useStablecoinPrice(showInverted ? price.baseCurrency : price.quoteCurrency)
  // /*
  //  * calculate needed amount of decimal prices, for prices between 0.95-1.05 use 4 decimal places
  //  */
  // const p = Number(usdcPrice?.toFixed())
  // const visibleDecimalPlaces = p < 1.05 ? 4 : 2

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
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      // title={text}
    >
      <Text fontWeight={500} fontSize={13} color={theme.text1}>
        {/* {text} */}
        <LightGreyText>{baseText}</LightGreyText>
        <span title={`${fullFormattedPrice} ${label}`}>{quoteText}</span>
        {fiatValue && <LightGreyText>{fiatText}</LightGreyText>}
      </Text>{' '}
      {/* {usdcPrice && (
        <ThemedText.DarkGray>
          <Trans>(${usdcPrice.toFixed(visibleDecimalPlaces, { groupSeparator: ',' })})</Trans>
        </ThemedText.DarkGray>
      )} */}
    </StyledPriceContainer>
  )
}
