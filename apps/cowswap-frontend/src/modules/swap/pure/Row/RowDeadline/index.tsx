import { INPUT_OUTPUT_EXPLANATION, MINIMUM_ETH_FLOW_DEADLINE_SECONDS } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { HoverTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { RowSlippageProps } from 'modules/swap/containers/Row/RowSlippage'
import { ClickableText } from 'modules/swap/pure/Row/RowSlippageContent'
import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps } from 'modules/swap/pure/Row/typings'
import { StyledInfoIcon, TransactionText } from 'modules/swap/pure/styled'

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined) {
  return (
    <Trans>
      {symbols?.[0] || 'Native currency (e.g ETH)'} orders require a minimum transaction expiration time threshold of{' '}
      {MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60} minutes to ensure the best swapping experience.
      <br /><br />
      Orders not matched
      after the threshold time are automatically refunded.
    </Trans>
  )
}
export function getNonNativeOrderDeadlineTooltip() {
  return (
    <Trans>
      Your swap expires and will not execute if it is pending for longer than the selected duration.
      {INPUT_OUTPUT_EXPLANATION}
    </Trans>
  )
}

export interface RowDeadlineProps extends Omit<RowSlippageProps, 'allowedSlippage'> {
  toggleSettings: Command
  isEoaEthFlow: boolean
  symbols?: (string | undefined)[]
  displayDeadline: string
  styleProps?: RowStyleProps
  userDeadline: number
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

export function RowDeadlineContent(props: RowDeadlineProps) {
  const { showSettingOnClick, toggleSettings, displayDeadline, isEoaEthFlow, symbols, styleProps } = props
  const deadlineTooltipContent = isEoaEthFlow
    ? getNativeOrderDeadlineTooltip(symbols)
    : getNonNativeOrderDeadlineTooltip()

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <DeadlineTextContents isEoaEthFlow={isEoaEthFlow} />
            </ClickableText>
          ) : (
            <DeadlineTextContents isEoaEthFlow={isEoaEthFlow} />
          )}
        </TextWrapper>
        <HoverTooltip wrapInContainer content={deadlineTooltipContent}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        {showSettingOnClick ? (
          <ClickableText onClick={toggleSettings}>{displayDeadline}</ClickableText>
        ) : (
          <span>{displayDeadline}</span>
        )}
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
