import React, { useContext } from 'react'
import { CurrencyAmount, Currency, TradeType } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components'
import { TYPE } from 'theme'

import { formatSmart } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'
import { StyledInfo } from 'pages/Swap/SwapMod'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { AMOUNT_PRECISION, FIAT_PRECISION } from 'constants/index'
import { LightGreyText } from 'pages/Swap'
import { useUSDCValue } from 'hooks/useUSDCPrice'

export const GASLESS_FEE_TOOLTIP_MSG =
  'On CowSwap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

export const PRESIGN_FEE_TOOLTIP_MSG =
  'These fees cover the gas costs for executing the order once it has been placed. However - since you are using a smart contract wallet - you will need to pay the gas for signing an on-chain tx in order to place it.'

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeGp | null): {
  realizedFee: CurrencyAmount<Currency> | undefined | null
} {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  // const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency,
  }
}

export interface RowFeeProps {
  // Although fee is part of the trade, if the trade is invalid, then it will be undefined
  // Even for invalid trades, we want to display the fee, this is why there's another "fee" parameter
  trade?: TradeGp
  fee?: CurrencyAmount<Currency>

  showHelpers: boolean
  allowsOffchainSigning: boolean
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
}

export function RowFee({
  trade,
  fee,
  allowsOffchainSigning,
  showHelpers,
  fontSize = 14,
  fontWeight = 500,
  rowHeight,
}: RowFeeProps) {
  const theme = useContext(ThemeContext)
  const { realizedFee } = React.useMemo(() => computeTradePriceBreakdown(trade), [trade])
  // trades are null when there is a fee quote error e.g
  // so we can take both
  const feeAmount = trade?.fee.feeAsCurrency || fee
  const feeFiatValue = useUSDCValue(feeAmount)
  const feeFiatDisplay = `(≈$${formatSmart(feeFiatValue, FIAT_PRECISION)})`

  const displayFee = realizedFee || fee
  const feeCurrencySymbol = displayFee?.currency.symbol || '-'
  const fullDisplayFee = displayFee?.toFixed(displayFee?.currency.decimals) || '-'

  const includeGasMessage = allowsOffchainSigning ? ' (incl. gas costs)' : ''
  const tooltip = allowsOffchainSigning ? GASLESS_FEE_TOOLTIP_MSG : PRESIGN_FEE_TOOLTIP_MSG

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <TYPE.black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          Fees {includeGasMessage}
        </TYPE.black>
        {showHelpers && (
          <MouseoverTooltipContent content={tooltip} bgColor={theme.bg1} color={theme.text1}>
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <TYPE.black fontSize={fontSize} color={theme.text1} title={`${fullDisplayFee} ${feeCurrencySymbol}`}>
        {formatSmart(displayFee, AMOUNT_PRECISION)} {feeCurrencySymbol}{' '}
        {feeFiatValue && <LightGreyText>{feeFiatDisplay}</LightGreyText>}
      </TYPE.black>
    </RowBetween>
  )
}
