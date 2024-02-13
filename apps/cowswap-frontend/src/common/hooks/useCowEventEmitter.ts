import { useContext } from 'react'

import { CowEventEmitter, CowEventEmitterContext } from '@cowprotocol/events'

export function useCowEventEmitter(): CowEventEmitter {
  const eventEmitter = useContext(CowEventEmitterContext)

  if (!eventEmitter) {
    throw new Error('useCowEventEmitter is not in the context. Please use CowEventEmitterContext')
  }

  return eventEmitter
}
