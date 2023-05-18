import ms from 'ms'
import { useMemo } from 'react'
import { useDeadline } from '../containers/DeadlineSelector/hooks/useDeadline'
import { useNoOfParts } from './useParts'
import { displayTime } from '../utils/displayTime'

export function useSinglePartTime() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()
  const { numberOfPartsValue } = useNoOfParts()

  return useMemo(() => {
    const { hours: h, minutes: m } = customDeadline
    const totalTime = isCustomDeadline ? ms(`${h}h`) + ms(`${m}m`) : deadline
    const partTime = totalTime / numberOfPartsValue

    let days = Math.floor(ms(`${partTime}ms`) / ms('1d'))
    let hours = Math.floor((ms(`${partTime}ms`) % ms('1d')) / ms('1h'))
    let minutes = Math.floor((ms(`${partTime}ms`) % ms('1h')) / ms('1m'))

    return displayTime({
      defaultOutput: '-',
      minutes,
      days,
      hours,
    })
  }, [deadline, numberOfPartsValue, customDeadline, isCustomDeadline])
}
