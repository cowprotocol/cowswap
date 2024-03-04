import { InlineBanner } from '@cowprotocol/ui'

import { MAX_PART_TIME } from '../../../const'
import { deadlinePartsDisplay } from '../../../utils/deadlinePartsDisplay'

export function BigPartTimeWarning() {
  const time = deadlinePartsDisplay(MAX_PART_TIME, true)

  return (
    <InlineBanner>
      <strong>Too much time between parts</strong>
      <p>
        A maximum of <strong>{time}</strong> between parts is required. Increase the number of parts or decrease the
        total duration.
      </p>
    </InlineBanner>
  )
}
