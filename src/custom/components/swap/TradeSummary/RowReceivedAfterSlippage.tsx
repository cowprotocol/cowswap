import { useContext, useMemo } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { ThemedText } from 'theme'

import { Field } from 'state/swap/actions'
import { getMinimumReceivedTooltip } from 'utils/tooltips'
import { formatMax, formatSmart } from 'utils/format'
import TradeGp from 'state/swap/TradeGp'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { StyledInfo } from 'pages/Swap/styleds'
import { AMOUNT_PRECISION } from 'constants/index'

export interface RowReceivedAfterSlippageProps {
  trade: TradeGp
  allowedSlippage: Percent
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
  showHelpers: boolean
  allowsOffchainSigning: boolean
}

export function RowReceivedAfterSlippage({
  trade,
  allowedSlippage,
  fontSize = 14,
  fontWeight = 500,
  rowHeight,
  showHelpers = true,
}: RowReceivedAfterSlippageProps) {
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const [slippageOut, slippageIn] = useMemo(
    () => [slippageAdjustedAmounts[Field.OUTPUT], slippageAdjustedAmounts[Field.INPUT]],
    [slippageAdjustedAmounts]
  )
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT

  const [swapAmount, symbol] = isExactIn
    ? [slippageOut, trade.outputAmount.currency.symbol]
    : [slippageIn, trade.inputAmount.currency.symbol]

  const fullOutAmount = formatMax(swapAmount, swapAmount?.currency.decimals) || '-'

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <ThemedText.Black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <Trans>Minimum received (incl. fee)</Trans>
          ) : (
            <Trans>Maximum sent (incl. fee)</Trans>
          )}
        </ThemedText.Black>
        {showHelpers && (
          <MouseoverTooltipContent
            content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)}
            bgColor={theme.bg1}
            color={theme.text1}
            wrap
          >
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <ThemedText.Black textAlign="right" fontSize={fontSize} color={theme.text1} title={`${fullOutAmount} ${symbol}`}>
        {`${formatSmart(swapAmount, AMOUNT_PRECISION) || '-'} ${symbol}`}
      </ThemedText.Black>
    </RowBetween>
  )
}
