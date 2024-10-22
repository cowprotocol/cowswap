import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'common/utils/tradeSettingsTooltips'

import { StyledRowBetween, TextWrapper, StyledInfoIcon, TransactionText, RowStyleProps } from '../styled'

export interface RowDeadlineProps {
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  displayDeadline: string
  styleProps?: RowStyleProps
  userDeadline: number
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
}

export function RowDeadlineContent(props: RowDeadlineProps) {
  const { displayDeadline, isEoaEthFlow, symbols, styleProps } = props
  const deadlineTooltipContent = isEoaEthFlow
    ? getNativeOrderDeadlineTooltip(symbols)
    : getNonNativeOrderDeadlineTooltip()

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          <DeadlineTextContents isEoaEthFlow={isEoaEthFlow} />
        </TextWrapper>
        <HoverTooltip wrapInContainer content={deadlineTooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        <span>{displayDeadline}</span>
      </TextWrapper>
    </StyledRowBetween>
  )
}

type DeadlineTextContentsProps = { isEoaEthFlow: boolean }

function DeadlineTextContents({ isEoaEthFlow }: DeadlineTextContentsProps) {
  return (
    <TransactionText>
      <Trans>Transaction expiration</Trans>
      {isEoaEthFlow && <i>(modified)</i>}
    </TransactionText>
  )
}
