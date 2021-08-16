import React, { useContext, useMemo } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'
import styled, { ThemeContext } from 'styled-components'
import { Trans } from '@lingui/macro'
import { TYPE } from 'theme'

import { Field } from 'state/swap/actions'
import TradeSummaryMod from './TradeSummaryMod'
import { WithClassName } from 'types'
import { AdvancedSwapDetailsProps } from '../AdvancedSwapDetails'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { StyledInfo } from 'pages/Swap/SwapMod'
import TradeGp from 'state/swap/TradeGp'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { getMinimumReceivedTooltip } from 'utils/tooltips'
import { formatSmart } from 'utils/format'
import { ClickableText } from 'pages/Pool/styleds'
import { useToggleSettingsMenu } from 'state/application/hooks'

export interface RowSlippageProps {
  allowedSlippage: Percent
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
  showSettingOnClick?: boolean
}
export function RowSlippage({
  allowedSlippage,
  fontSize = 14,
  fontWeight = 500,
  rowHeight,
  showSettingOnClick = true,
}: RowSlippageProps) {
  const theme = useContext(ThemeContext)
  const toggleSettings = useToggleSettingsMenu()

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <TYPE.black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          {showSettingOnClick ? (
            <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
              <Trans>Slippage tolerance</Trans>
            </ClickableText>
          ) : (
            <Trans>Slippage tolerance</Trans>
          )}
        </TYPE.black>
        <MouseoverTooltipContent
          bgColor={theme.bg3}
          color={theme.text1}
          content={
            <Trans>
              <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
              <p>
                The slippage you pick here enables a resubmission of your order in case of unfavourable price movements.
              </p>
              <p>{INPUT_OUTPUT_EXPLANATION}</p>
            </Trans>
          }
        >
          <StyledInfo />
        </MouseoverTooltipContent>
      </RowFixed>
      <TYPE.black textAlign="right" fontSize={fontSize} color={theme.text1}>
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{allowedSlippage.toFixed(2)}%</ClickableText>
        ) : (
          <span>{allowedSlippage.toFixed(2)}%</span>
        )}
      </TYPE.black>
    </RowBetween>
  )
}

export interface RowReceivedAfterSlippageProps {
  trade: TradeGp
  allowedSlippage: Percent
  fontWeight?: number
  fontSize?: number
  rowHeight?: number
  showHelpers: boolean
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

  const fullOutAmount = swapAmount?.toFixed(swapAmount?.currency.decimals) || '-'

  return (
    <RowBetween height={rowHeight}>
      <RowFixed>
        <TYPE.black fontSize={fontSize} fontWeight={fontWeight} color={theme.text2}>
          {trade.tradeType === TradeType.EXACT_INPUT ? (
            <Trans>Minimum received (incl. fee)</Trans>
          ) : (
            <Trans>Maximum sent (incl. fee)</Trans>
          )}
        </TYPE.black>
        {showHelpers && (
          <MouseoverTooltipContent
            content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)}
            bgColor={theme.bg1}
            color={theme.text1}
          >
            <StyledInfo />
          </MouseoverTooltipContent>
        )}
      </RowFixed>

      <TYPE.black textAlign="right" fontSize={fontSize} color={theme.text1} title={`${fullOutAmount} ${symbol}`}>
        {/* {trade.tradeType === TradeType.EXACT_INPUT
            ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
            : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`} */}
        {`${formatSmart(swapAmount) || '-'} ${symbol}`}
      </TYPE.black>
    </RowBetween>
  )
}

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text4};
    }
  }
`

export type TradeSummaryProps = Required<AdvancedSwapDetailsProps> & WithClassName

export default function TradeSummary({ className, trade, allowedSlippage, showHelpers, showFee }: TradeSummaryProps) {
  return (
    <Wrapper className={className}>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} showHelpers={showHelpers} showFee={showFee} />
    </Wrapper>
  )
}
