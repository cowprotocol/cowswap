import { ReactNode } from 'react'

import { HoverTooltip, LinkStyledButton, RowFixed, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { RowStyleProps, StyledInfoIcon, StyledRowBetween, TextWrapper } from '../styled'

export interface RowRewardsContentProps {
  onAddCode?: () => void
  onManageCode?: () => void
  tooltipContent?: ReactNode
  linkedCode?: string
  accountLink?: string
  styleProps?: RowStyleProps
}

export function RowRewardsContent(props: RowRewardsContentProps): ReactNode {
  const { onAddCode, onManageCode, tooltipContent, linkedCode, accountLink, styleProps } = props
  const tooltip = tooltipContent ?? <Trans>Add a referral code to earn rewards.</Trans>

  const renderAction = (): ReactNode => {
    if (!linkedCode) {
      return (
        <LinkStyledButton
          onClick={onAddCode}
          padding="0"
          margin="0"
          fontSize="inherit"
          color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
        >
          <Trans>Add code</Trans>
        </LinkStyledButton>
      )
    }

    if (onManageCode) {
      return (
        <LinkStyledButton
          as="button"
          onClick={onManageCode}
          type="button"
          padding="0"
          margin="0"
          fontSize="inherit"
          color={`var(${UI.COLOR_PRIMARY_LIGHTER})`}
        >
          {linkedCode}
        </LinkStyledButton>
      )
    }

    return (
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
    )
  }

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
      <TextWrapper textAlign="right">{renderAction()}</TextWrapper>
    </StyledRowBetween>
  )
}
