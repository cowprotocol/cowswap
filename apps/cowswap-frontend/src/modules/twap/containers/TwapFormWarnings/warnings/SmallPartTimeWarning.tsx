import { ReactNode } from 'react'

import { InlineBanner, LinkStyledButton, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { MINIMUM_PART_TIME } from '../../../const'
import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'

interface SmallPartTimeWarningProps {
  maxPartsValue?: number
  onUseMaxParts?(): void
}

const UseMaxPartsLink = styled(LinkStyledButton)`
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;

  :hover,
  :focus,
  :active {
    text-decoration: underline;
  }
`

export function SmallPartTimeWarning({ maxPartsValue, onUseMaxParts }: SmallPartTimeWarningProps): ReactNode {
  const time = deadlinePartsDisplay(MINIMUM_PART_TIME, true)
  const hasMaxPartsAction = Boolean(onUseMaxParts && maxPartsValue)

  return (
    <InlineBanner>
      <strong>
        <Trans>Insufficient time between parts</Trans>
      </strong>
      <p>
        <Trans>
          A minimum of <strong>{time}</strong> between parts is required. Decrease the number of parts or increase the
          total duration.
        </Trans>
      </p>
      {hasMaxPartsAction && (
        <p>
          <UseMaxPartsLink onClick={onUseMaxParts}>
            <Trans>Set to maximum parts ({maxPartsValue})</Trans>
          </UseMaxPartsLink>
        </p>
      )}
    </InlineBanner>
  )
}
