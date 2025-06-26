import { useLocalTimeOffset } from './localTimeOffsetState'

import { GlobalWarning } from '../../pure/GlobalWarning'

const TIME_OFFSET_THRESHOLD = 60 // 60 seconds

/**
 * When the local device time is not valid ()
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InvalidLocalTimeWarning() {
  const localTimeOffset = useLocalTimeOffset()

  if (!localTimeOffset || localTimeOffset < TIME_OFFSET_THRESHOLD) return null

  console.debug('Local time offset:', localTimeOffset)

  return (
    <GlobalWarning>
      Local device time is not accurate, CoW Swap most likely will not work correctly. Please adjust your device's time.
    </GlobalWarning>
  )
}
