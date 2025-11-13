import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { MAX_PART_TIME } from '../../../const'
import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BigPartTimeWarning() {
  const time = deadlinePartsDisplay(MAX_PART_TIME, true)

  return (
    <InlineBanner>
      <strong>
        <Trans>Too much time between parts</Trans>
      </strong>
      <p>
        <Trans>
          A maximum of <strong>{time}</strong> between parts is required. Increase the number of parts or decrease the
          total duration.
        </Trans>
      </p>
    </InlineBanner>
  )
}
