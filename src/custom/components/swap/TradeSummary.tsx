import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { CurrencyAmount, TradeType } from '@uniswap/sdk'

import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'
import {
  computeSlippageAdjustedAmounts
  // computeTradePriceBreakdown as computeTradePriceBreakdownUni
} from 'utils/prices'
import { getMinimumReceivedTooltip } from 'utils/tooltips'

import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { TradeWithFee } from 'state/swap/extension'
import { DEFAULT_PRECISION } from 'constants/index'

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: TradeWithFee | null
): { /*priceImpactWithoutFee: Percent | undefined;*/ realizedFee: CurrencyAmount | undefined | null } {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  // const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    // priceImpactWithoutFee,
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency
  }
}

export const FEE_TOOLTIP_MSG =
  'On CowSwap you sign your order (hence no gas costs!). The fees are covering your gas costs already.'

export default function TradeSummary({ trade, allowedSlippage }: { trade: TradeWithFee; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)
  // const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const { /*priceImpactWithoutFee,*/ realizedFee } = React.useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <>
      <AutoColumn style={{ padding: '0 16px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {isExactIn ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text={getMinimumReceivedTooltip(allowedSlippage, isExactIn)} />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                  '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                  '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        {/* 
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween> 
        */}

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {/* Liquidity Provider Fee */}
              Fee
            </TYPE.black>
            {/* <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." /> */}
            <QuestionHelper text={FEE_TOOLTIP_MSG} />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            {realizedFee ? `${realizedFee.toSignificant(DEFAULT_PRECISION)} ${realizedFee.currency.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}
