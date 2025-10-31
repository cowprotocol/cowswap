import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../styled'

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
        <LinkStyledButton
          onClick={onAddCode}
          padding="0"
          margin="0"
          fontSize="inherit"
          color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
        >
          <Trans>Add code</Trans>
        </LinkStyledButton>
      </TextWrapper>
    </StyledRowBetween>
  )
}
