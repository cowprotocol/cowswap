import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { useLocalTimeOffset } from './localTimeOffsetState'

import { GlobalWarning } from '../../pure/GlobalWarning'

const TIME_OFFSET_THRESHOLD = 60 // 60 seconds

/**
 * When the local device time is not valid ()
 */
export function InvalidLocalTimeWarning(): ReactNode | null {
  const localTimeOffset = useLocalTimeOffset()

  if (!localTimeOffset || Math.abs(localTimeOffset) < TIME_OFFSET_THRESHOLD) return null

  console.debug('Local time offset:', localTimeOffset)

  return (
    <GlobalWarning>
      <Trans>
        Local device time is not accurate, CoW Swap most likely will not work correctly. Please adjust your device's
        time.
      </Trans>
    </GlobalWarning>
  )
}
