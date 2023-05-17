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

    let days = Math.floor(ms(`${partTime}ms`) / ms('1d'))
    let hours = Math.floor((ms(`${partTime}ms`) % ms('1d')) / ms('1h'))
    let minutes = Math.floor((ms(`${partTime}ms`) % ms('1h')) / ms('1m'))

    return displayTime({
      defaultOutput: '-',
      minutes,
      days,
      hours,
    })
  }, [deadline, numberOfParts, customDeadline, isCustomDeadline])
}
