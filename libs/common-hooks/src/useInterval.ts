import { useEffect } from 'react'

import { Command } from '@cowprotocol/types'

import { usePreviousRef } from './usePrevious'

/**
 * Invokes callback repeatedly over an interval defined by the delay
 * @param callback
 * @param delay if null, the callback will not be invoked
 * @param leading if true, the callback will be invoked immediately (on the leading edge); otherwise, it will be invoked after delay
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useInterval(callback: Command, delay: null | number, leading = true) {
  const savedCallbackRef = usePreviousRef(callback)

  // Set up the interval.
  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function tick() {
      savedCallbackRef.current?.()
    }

    if (delay !== null) {
      if (leading) tick()
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return
  }, [delay, leading, savedCallbackRef])
}
