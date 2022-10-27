import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import { RowFixed } from 'components/Row'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { INPUT_OUTPUT_EXPLANATION } from 'constants/index'
import { StyledInfo } from '@cow/pages/Swap/styleds'
import { RowSlippageProps } from '@cow/modules/swap/containers/Row/RowSlippage'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { RowStyleProps } from '@cow/modules/swap/pure/Row/typings'
import { ThemedText } from 'theme/index'
import { DEADLINE_LOWER_THRESHOLD_SECONDS } from '@cow/modules/swap/state/EthFlow/updaters'

const ClickableText = styled.button<{ isWarn?: boolean }>`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 13px;
  color: ${({ isWarn, theme }) => theme[isWarn ? 'text2' : 'text1']};
`

export function getNativeOrderDeadlineTooltip(symbols: (string | undefined)[] | undefined) {
  return (
    <Trans>
      <p>
        {symbols?.[0] || 'Native currency (e.g ETH)'} orders require a minimum transaction expiration time threshold of{' '}
        {DEADLINE_LOWER_THRESHOLD_SECONDS / 60} minutes to ensure the best swapping experience. Orders not matched after
        the threshold time are automatically refunded.
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

export function RowDeadlineContent(props: RowDeadlineProps) {
  const { userDeadline, showSettingOnClick, toggleSettings, displayDeadline, isEthFlow, symbols, styleProps } = props

  if (!isEthFlow || userDeadline > DEADLINE_LOWER_THRESHOLD_SECONDS) return null

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          <Trans>
            Transaction expiration{' '}
            <ThemedText.Warn display="inline-block" override>
              (modified)
            </ThemedText.Warn>
          </Trans>
        </TextWrapper>
        <MouseoverTooltipContent wrap content={getNativeOrderDeadlineTooltip(symbols)}>
          <StyledInfo />
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
