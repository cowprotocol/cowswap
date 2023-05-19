import ms from 'ms'
import { useMemo } from 'react'
import { ordersDeadlines } from '../deadlines'
import { useDeadline } from './useDeadline'
import { displayTime } from '@cow/modules/advancedOrders/utils/displayTime'

export function useDisplayDeadline() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()

  return useMemo(() => {
    if (!isCustomDeadline) {
      return ordersDeadlines.find((d) => deadline === d.value)?.title
    } else {
      const { minutes, hours } = customDeadline
      const time = ms(`${hours}h`) + ms(`${minutes}m`)

      return displayTime({
        defaultOutput: 'Select time',
        time,
      })
    }
  }, [isCustomDeadline, deadline, customDeadline])
}
