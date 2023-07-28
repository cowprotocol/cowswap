import { useEffect, useRef } from 'react'

import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'

export interface UseIntervalParams {
  /**
   * Callback to be executed on each interval
   * @returns a
   */
  callback: () => void

  /**
   * Interval frequency in milliseconds. Set delay to null to stop the interval so the callback is not executed
   */
  delay: number | null

  /**
   * If true, the callback will be executed immediately instead of waiting for the next interval
   */
  triggerEagerly: boolean

  /**
   * Name of the polling function. Just for debugging porpouses
   */
  name: string
}

/**
 * Invokes callback repeatedly over an interval defined by the delay
 */
export function useInterval(props: UseIntervalParams) {
  const { callback, delay, triggerEagerly = true, name } = props
  const isWindowVisible = useIsWindowVisible()
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function executeCallBack() {
      const { current: currentCallback } = savedCallback
      if (isWindowVisible && currentCallback) {
        console.debug(`[useInterval:${name}] Execute callback`)
        currentCallback()
      }
    }

    if (delay === null || !isWindowVisible) {
      return
    }

    console.debug(`[useInterval:${name}] Schedule interval`)
    if (triggerEagerly) {
      executeCallBack()
    }
    const id = setInterval(executeCallBack, delay)
    return () => clearInterval(id)
  }, [delay, triggerEagerly, isWindowVisible, name])
}
