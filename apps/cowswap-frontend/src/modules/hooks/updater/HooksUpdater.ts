import { useEffect } from 'react'

import { CowEventEmitter, CowEvents } from '@cowprotocol/events'

export interface HooksUpdaterProps {
  eventEmitter: CowEventEmitter
}

export function HooksUpdater(props: HooksUpdaterProps): null {
  const { eventEmitter } = props

  useEffect(() => {
    const addedHookListener = eventEmitter.on({
      event: CowEvents.ON_ADDED_HOOK,
      handler: (event) => {
        console.log(event)
      },
    })

    const removedHookListener = eventEmitter.on({
      event: CowEvents.ON_REMOVED_HOOK,
      handler: (event) => {
        console.log(event)
      },
    })

    return () => {
      eventEmitter.off(addedHookListener)
      eventEmitter.off(removedHookListener)
    }
  }, [])
  return null
}
