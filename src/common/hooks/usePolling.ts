import { useCallback, useEffect } from 'react'

import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'

export interface UsePollingParams {
  /**
   * Callback to be executed on each polling
   * @returns a
   */
  callback: () => void

  /**
   * Polling frequency in milliseconds
   */
  pollingFrequency: number

  /**
   * If true, the polling will be executed immediately instead of waiting for the next interval
   */
  triggerEagerly?: boolean

  /**
   * Name of the polling function. Just for debugging porpouses
   */
  name: string
}

/**
 *  Hook to execute a function periodically
 *
 * @param params Parameters to configure the polling
 */
export function usePolling(params: UsePollingParams): void {
  const { callback, pollingFrequency, triggerEagerly = true, name } = params
  const isWindowVisible = useIsWindowVisible()

  const doPolling = useCallback(() => {
    console.debug(`[usePolling][${name}] Executing polling function`)
    callback()
  }, [callback, name])

  useEffect(() => {
    if (!isWindowVisible) {
      console.debug(`[usePolling][${name}] No need to do polling`)
      return
    }

    console.debug(`[usePolling][${name}] Schedule polling`)
    const intervalId = setInterval(doPolling, pollingFrequency)

    if (triggerEagerly) {
      doPolling()
    }
    return () => clearInterval(intervalId)
  }, [doPolling, pollingFrequency, triggerEagerly, name, isWindowVisible])
}
