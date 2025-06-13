
import { HoverTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import Badge, { BadgeVariant } from 'legacy/components/Badge'

const BadgeWrapper = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
`

const ActiveDot = styled.span`
  background-color: ${({ theme }) => theme.success};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-right: 4px;
`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export default function RangeBadge({
  removed,
  inRange,
}: {
  removed: boolean | undefined
  inRange: boolean | undefined
}) {
  return (
    <BadgeWrapper>
      {removed ? (
        <HoverTooltip wrapInContainer content={<Trans>Your position has 0 liquidity, and is not earning fees.</Trans>}>
          <Badge variant={BadgeVariant.DEFAULT}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>
              <Trans>Closed</Trans>
            </BadgeText>
          </Badge>
        </HoverTooltip>
      ) : inRange ? (
        <HoverTooltip wrapInContainer 
          content={
            <Trans>
              The price of this pool is within your selected range. Your position is currently earning fees.
            </Trans>
          }
        >
          <Badge variant={BadgeVariant.DEFAULT}>
            <ActiveDot /> &nbsp;
            <BadgeText>
              <Trans>In range</Trans>
            </BadgeText>
          </Badge>
        </HoverTooltip>
      ) : (
        <HoverTooltip wrapInContainer 
          content={
            <Trans>
              The price of this pool is outside of your selected range. Your position is not currently earning fees.
            </Trans>
          }
        >
          <Badge variant={BadgeVariant.WARNING}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>
              <Trans>Out of range</Trans>
            </BadgeText>
          </Badge>
        </HoverTooltip>
      )}
    </BadgeWrapper>
  )
}
