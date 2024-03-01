import { ReactNode } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { MouseoverTooltipContent, RowFixed, TokenAmount } from '@cowprotocol/ui'
import { Percent, TradeType } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import TradeGp from 'legacy/state/swap/TradeGp'
import { Field } from 'legacy/state/types'
import { computeSlippageAdjustedAmounts } from 'legacy/utils/prices'

import { StyledRowBetween, TextWrapper } from '../../../pure/Row/styled'
import { StyledInfoIcon } from '../../../pure/styled'

export interface RowReceivedAfterSlippageProps {
  trade: TradeGp
  allowedSlippage: Percent
  highlightAmount?: boolean
  children?: ReactNode
  className?: string
}

export function RowReceivedAfterSlippage({
  trade,
  allowedSlippage,
  highlightAmount,
  children,
  className,
}: RowReceivedAfterSlippageProps) {
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT

  const swapAmount = isExactIn ? slippageAdjustedAmounts[Field.OUTPUT] : slippageAdjustedAmounts[Field.INPUT]

  const Amount = <TokenAmount amount={swapAmount} defaultValue="-" tokenSymbol={swapAmount?.currency} />

  return (
    <StyledRowBetween className={className}>
      <RowFixed>
        {children || (
          <TextWrapper>
            {trade.tradeType === TradeType.EXACT_INPUT ? (
              <Trans>Minimum received (incl. fee)</Trans>
            ) : (
              <Trans>Maximum sent (incl. fee)</Trans>
            )}
          </TextWrapper>
        )}
        <MouseoverTooltipContent content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)} wrap>
          <StyledInfoIcon size={16} />
        </MouseoverTooltipContent>
      </RowFixed>

      <TextWrapper textAlign="right">{highlightAmount ? <b>{Amount}</b> : Amount}</TextWrapper>
    </StyledRowBetween>
  )
}
