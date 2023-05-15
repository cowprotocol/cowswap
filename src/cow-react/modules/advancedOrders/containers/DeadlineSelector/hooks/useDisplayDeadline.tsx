import { useMemo } from 'react'
import { ordersDeadlines } from '../deadlines'
import { useDeadline } from './useDeadline'

export function useDisplayDeadline() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()

  return useMemo(() => {
    if (!isCustomDeadline) {
      return ordersDeadlines.find((d) => deadline === d.value)?.title
    } else {
      const { minutes, hours } = customDeadline

      if (minutes && hours) return `${hours} hours ${minutes} minutes`
      else if (hours) return `${hours} hours`
      else if (minutes) return `${minutes} minutes`
      else return 'Set total time'
    }
  }, [isCustomDeadline, deadline, customDeadline])
}
