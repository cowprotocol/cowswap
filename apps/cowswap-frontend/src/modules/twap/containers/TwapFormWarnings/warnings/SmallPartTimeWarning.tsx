import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { MINIMUM_PART_TIME } from '../../../const'
import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SmallPartTimeWarning() {
  const time = deadlinePartsDisplay(MINIMUM_PART_TIME, true)

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
    </InlineBanner>
  )
}
