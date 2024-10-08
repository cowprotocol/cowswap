import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps } from 'modules/swap/pure/Row/typings'
import { StyledInfoIcon, TransactionText } from 'modules/swap/pure/styled'

import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'common/utils/tradeSettingsTooltips'

export interface RowDeadlineProps {
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  displayDeadline: string
  styleProps?: RowStyleProps
  userDeadline: number
  slippageLabel?: React.ReactNode
  slippageTooltip?: React.ReactNode
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

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
