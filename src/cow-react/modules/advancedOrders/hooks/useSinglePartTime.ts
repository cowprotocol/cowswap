import ms from 'ms'
import { useMemo } from 'react'
import { useDeadline } from '../containers/DeadlineSelector/hooks/useDeadline'
import { useNoOfParts } from './useParts'
import { displayTime } from '../utils/displayTime'

export function useSinglePartTime() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()
  const { numberOfParts } = useNoOfParts()

  return useMemo(() => {
    const { hours: h, minutes: m } = customDeadline

    const totalTime = isCustomDeadline ? ms(`${h}h`) + ms(`${m}m`) : deadline
    const partTime = totalTime / numberOfParts

    const date = new Date(partTime)
    const minutes = date.getUTCMinutes()
    const hours = date.getUTCHours()
    const seconds = date.getUTCSeconds()

    return displayTime({
      defaultOutput: '',
      minutes,
      seconds,
      hours,
    })
  }, [deadline, numberOfParts, customDeadline, isCustomDeadline])
}
