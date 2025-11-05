import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../styled'

export interface RowRewardsContentProps {
  onAddCode?: () => void
  tooltipContent?: ReactNode
  linkedCode?: string
  accountLink?: string
  styleProps?: RowStyleProps
}

export function RowRewardsContent(props: RowRewardsContentProps): ReactNode {
  const { onAddCode, tooltipContent, linkedCode, accountLink, styleProps } = props
  const tooltip = tooltipContent ?? <Trans>Add a referral code to earn rewards.</Trans>

  return (
    <StyledRowBetween {...styleProps}>
      <RowFixed>
        <TextWrapper>
          <Trans>Rewards code</Trans>
        </TextWrapper>
        <HoverTooltip wrapInContainer content={tooltip}>
          <StyledInfoIcon size={16} />
        </HoverTooltip>
      </RowFixed>
      <TextWrapper textAlign="right">
        {linkedCode ? (
          <LinkStyledButton
            as="a"
            href={accountLink ?? '/#/account'}
            padding="0"
            margin="0"
            fontSize="inherit"
            color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
          >
            {linkedCode}
          </LinkStyledButton>
        ) : (
          <LinkStyledButton
            onClick={onAddCode}
            padding="0"
            margin="0"
            fontSize="inherit"
            color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
          >
            <Trans>Add code</Trans>
          </LinkStyledButton>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}
