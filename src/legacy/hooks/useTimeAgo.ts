import { useCallback, useState } from 'react'

import * as timeago from 'timeago.js'

import { usePolling } from 'common/hooks/usePolling'

export default function useTimeAgo(value?: string | Date, interval = 1000): string {
  const [timeAgoValue, setTimeAgoValue] = useState('')

  const updateTime = useCallback(() => {
    if (!value) {
      setTimeAgoValue('')
      return
    }

    setTimeAgoValue(timeago.format(value))
  }, [value])

  usePolling({
    callback: updateTime,
    name: 'useTimeAgo',
    delay: interval,
    triggerEagerly: true,
  })

  return timeAgoValue
}
