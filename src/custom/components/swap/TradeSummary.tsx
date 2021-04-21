import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { CurrencyAmount, Percent, TradeType } from '@uniswap/sdk'

import { Field } from '@src/state/swap/actions'
import { TYPE } from '@src/theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown as computeTradePriceBreakdownUni
} from '@src/utils/prices'

import { AutoColumn } from '@src/components/Column'
import QuestionHelper from '@src/components/QuestionHelper'
import { RowBetween, RowFixed } from '@src/components/Row'
import FormattedPriceImpact from '@src/components/swap/FormattedPriceImpact'
import { TradeWithFee } from 'state/swap/extension'
import { DEFAULT_PRECISION } from 'constants/index'

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: TradeWithFee | null
): { priceImpactWithoutFee: Percent | undefined; realizedFee: CurrencyAmount | undefined | null } {
  // This is needed because we are using Uniswap pools for the price calculation,
  // thus, we need to account for the LP fees the same way as Uniswap does.
  const { priceImpactWithoutFee } = computeTradePriceBreakdownUni(trade)

  return {
    priceImpactWithoutFee,
    realizedFee:
      trade?.tradeType === TradeType.EXACT_INPUT
        ? trade?.outputAmountWithoutFee?.subtract(trade.outputAmount)
        : trade?.fee?.feeAsCurrency
  }
}

export default function TradeSummary({ trade, allowedSlippage }: { trade: TradeWithFee; allowedSlippage: number }) {
  const theme = useContext(ThemeContext)
  // const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const { priceImpactWithoutFee, realizedFee } = React.useMemo(() => computeTradePriceBreakdown(trade), [trade])
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
            <QuestionHelper text="Your transaction will expire if there is a large, unfavorable price movement before it is confirmed." />
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
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {/* Liquidity Provider Fee */}
              Fee
            </TYPE.black>
            {/* <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." /> */}
            <QuestionHelper text="Cow Swap has 0 gas fees. A portion of the sell amount in each trade goes to the Protocol." />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            {realizedFee ? `${realizedFee.toSignificant(DEFAULT_PRECISION)} ${realizedFee.currency.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}
