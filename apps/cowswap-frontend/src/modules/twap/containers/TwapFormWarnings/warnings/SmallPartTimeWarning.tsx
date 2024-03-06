import { InlineBanner } from '@cowprotocol/ui'

import { MINIMUM_PART_TIME } from '../../../const'
import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'

export function SmallPartTimeWarning() {
  const time = deadlinePartsDisplay(MINIMUM_PART_TIME, true)

  return (
    <InlineBanner>
      <strong>Insufficient time between parts</strong>
      <p>
        A minimum of <strong>{time}</strong> between parts is required. Decrease the number of parts or increase the
        total duration.
      </p>
    </InlineBanner>
  )
}
