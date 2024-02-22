import { useEffect, useState } from 'react'

import * as timeago from 'timeago.js'

export function useTimeAgo(value?: string | number | Date, interval = 1000): string {
  const [timeAgoValue, setTimeAgoValue] = useState('')

  useEffect(() => {
    if (!value) {
      setTimeAgoValue('')
      return
    } else {
      setTimeAgoValue(timeago.format(value))
    }

    const id = setInterval(() => {
      setTimeAgoValue(timeago.format(value))
    }, interval)

    return () => clearInterval(id)
  }, [value, interval])

  return timeAgoValue
}
