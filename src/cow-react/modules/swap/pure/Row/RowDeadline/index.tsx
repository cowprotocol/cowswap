import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION, MINIMUM_ETH_FLOW_DEADLINE_SECONDS } from 'constants/index'
import { RowSlippageProps } from '@cow/modules/swap/containers/Row/RowSlippage'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/typings'
import { ThemedText } from 'theme/index'
import { StyledInfoIcon } from '@cow/modules/swap/pure/styled'
import { ClickableText } from '@cow/modules/swap/pure/Row/RowSlippageContent'

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined) {
  return (
    <Trans>
      <p>
        {symbols?.[0] || 'Native currency (e.g ETH)'} orders require a minimum transaction expiration time threshold of{' '}
        {MINIMUM_ETH_FLOW_DEADLINE_SECONDS / 60} minutes to ensure the best swapping experience. Orders not matched
        after the threshold time are automatically refunded.
      </p>
    </Trans>
  )
}
export function getNonNativeOrderDeadlineTooltip() {
  return (
    <Trans>
      <p>
        Your swap expires and will not execute if it is pending for longer than the selected duration.
        {INPUT_OUTPUT_EXPLANATION}
      </p>
    </Trans>
  )
}

export interface RowDeadlineProps extends Omit<RowSlippageProps, 'allowedSlippage'> {
  toggleSettings: () => void
  isEthFlow: boolean
  symbols?: (string | undefined)[]
  displayDeadline: string
  styleProps?: RowStyleProps
  userDeadline: number
}

// TODO: RowDeadlineContent and RowSlippageContent are very similar. Refactor and extract base component?

export function RowDeadlineContent(props: RowDeadlineProps) {
  const { showSettingOnClick, toggleSettings, displayDeadline, isEthFlow, symbols, styleProps } = props
  const deadlineTooltipContent = isEthFlow ? getNativeOrderDeadlineTooltip(symbols) : getNonNativeOrderDeadlineTooltip()

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          {showSettingOnClick ? (
            <ClickableText onClick={toggleSettings}>
              <DeadlineTextContents isEthFlow={isEthFlow} />
            </ClickableText>
          ) : (
            <DeadlineTextContents isEthFlow={isEthFlow} />
          )}
        </TextWrapper>
        <MouseoverTooltipContent wrap content={deadlineTooltipContent}>
          <StyledInfoIcon size={16} />
        </MouseoverTooltipContent>
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

type DeadlineTextContentsProps = { isEthFlow: boolean }

function DeadlineTextContents({ isEthFlow }: DeadlineTextContentsProps) {
  return (
    <>
      <Trans>Transaction expiration</Trans>
      {isEthFlow && (
        <>
          {' '}
          <ThemedText.Warn override>(modified)</ThemedText.Warn>
        </>
      )}
    </>
  )
}
