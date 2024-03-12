import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { CowEventEmitter, CowEvents } from '@cowprotocol/events'

import { hooksAtom } from '../state/hooksAtom'

export interface HooksUpdaterProps {
  eventEmitter: CowEventEmitter
}

export function HooksUpdater(props: HooksUpdaterProps): null {
  const { eventEmitter } = props
  const updateHooks = useSetAtom(hooksAtom)

  useEffect(() => {
    const addedHookListener = eventEmitter.on({
      event: CowEvents.ON_ADDED_HOOK,
      handler: ({ hook: hookToAdd, isPreHook }) => {
        updateHooks((hooks) => {
          if (isPreHook) {
            return { preHooks: [...hooks.preHooks, hookToAdd], postHooks: hooks.postHooks }
          } else {
            return { preHooks: hooks.preHooks, postHooks: [...hooks.postHooks, hookToAdd] }
          }
        })
      },
    })

    const removedHookListener = eventEmitter.on({
      event: CowEvents.ON_REMOVED_HOOK,
      handler: ({ hook: hookToRemove, isPreHook }) => {
        updateHooks((hooks) => {
          if (isPreHook) {
            return { preHooks: hooks.preHooks.filter((hook) => hook === hookToRemove), postHooks: hooks.postHooks }
          } else {
            return { preHooks: hooks.preHooks, postHooks: hooks.postHooks.filter((hook) => hook === hookToRemove) }
          }
        })
      },
    })

    return () => {
      eventEmitter.off(addedHookListener)
      eventEmitter.off(removedHookListener)
    }
  }, [eventEmitter, updateHooks])
  return null
}
