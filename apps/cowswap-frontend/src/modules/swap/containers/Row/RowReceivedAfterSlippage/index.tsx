import { ReactNode } from 'react'

import { getMinimumReceivedTooltip } from '@cowprotocol/common-utils'
import { HoverTooltip, RowFixed, TokenAmount } from '@cowprotocol/ui'
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
              <Trans>Minimum received (incl. costs)</Trans>
            ) : (
              <Trans>Maximum sent (incl. costs)</Trans>
            )}
          </TextWrapper>
        )}
        <HoverTooltip content={getMinimumReceivedTooltip(allowedSlippage, isExactIn)} wrapInContainer>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>

      <TextWrapper textAlign="right">{highlightAmount ? <b>{Amount}</b> : Amount}</TextWrapper>
    </StyledRowBetween>
  )
}
