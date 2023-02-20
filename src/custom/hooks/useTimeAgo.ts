import { useEffect, useState } from 'react'
import * as timeago from 'timeago.js'

export default function useTimeAgo(value?: string | Date): string {
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
    }, 1000)

    return () => clearInterval(id)
  }, [value])

  return timeAgoValue
}
