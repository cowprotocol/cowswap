import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../styled'

const noop = (): void => undefined

const RewardsLinkButton = styled(LinkStyledButton)`
  padding: 0;
  color: var(${UI.COLOR_PRIMARY_LIGHTER});
`

export interface RowRewardsContentProps {
  onAddCode?: () => void
  tooltipContent?: ReactNode
  styleProps?: RowStyleProps
}

export function RowRewardsContent(props: RowRewardsContentProps): ReactNode {
  const { onAddCode, tooltipContent, styleProps } = props
  const tooltip = tooltipContent ?? <Trans>Add a referral code to earn rewards.</Trans>

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          <Trans>Rewards</Trans>
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltip}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        <RewardsLinkButton onClick={onAddCode ?? noop}>
          <Trans>Add code</Trans>
        </RewardsLinkButton>
      </TextWrapper>
    </StyledRowBetween>
  )
}
