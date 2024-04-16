import { GlobalWarning } from '@cowprotocol/ui'

import { useLocalTimeOffset } from './localTimeOffsetState'

const TIME_OFFSET_THRESHOLD = 60 // 60 seconds

/**
 * When the local device time is not valid ()
 */
export function InvalidLocalTimeWarning() {
  const localTimeOffset = useLocalTimeOffset()

  if (!localTimeOffset || localTimeOffset < TIME_OFFSET_THRESHOLD) return null

  console.debug('Local time offset:', localTimeOffset)

  return (
    <GlobalWarning>
      Local device time does not match real time, CoW Swap will most likely not work correctly. Please synchronize the
      time settings on your device with the real time.
    </GlobalWarning>
  )
}
