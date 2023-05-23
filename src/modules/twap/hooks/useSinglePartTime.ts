import ms from 'ms'
import { useMemo } from 'react'
import { useNoOfParts } from './useParts'
import { displayTime } from 'utils/displayTime'
import { useDeadline } from './useDeadline'

export function useSinglePartTime() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()
  const { numberOfPartsValue } = useNoOfParts()

  return useMemo(() => {
    const { hours: h, minutes: m } = customDeadline
    const totalTime = isCustomDeadline ? ms(`${h}h`) + ms(`${m}m`) : deadline
    const time = totalTime / numberOfPartsValue

    return displayTime({ time, defaultOutput: '-' })
  }, [deadline, numberOfPartsValue, customDeadline, isCustomDeadline])
}
