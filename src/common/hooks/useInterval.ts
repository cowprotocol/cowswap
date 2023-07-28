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
  triggerEagerly?: boolean

  /**
   * Name of the polling function. Just for debugging porpouses
   */
  name: string
}

// TODO: remove this
const NAMES = [
  '',
  // 'CancelledOrdersUpdater',
  // 'OrderProgressBar::updatePercentage',
  // 'popover',
  // 'useMachineTimeMs',
  // 'GasPriceStrategyUpdater',
  // 'GasPriceStrategyUpdater',
  // 'ListsUpdater',
  // 'CancelledOrdersUpdater',
  // 'ExpiredOrdersUpdater',
  // 'PendingOrdersUpdater:MARKET',
  // 'PendingOrdersUpdater:LIMIT'
  // 'SpotPricesUpdater',
  // 'UnfillableOrdersUpdater',
  // 'FeesUpdater',
  // 'FortuneWidget',
  // 'UnfillableOrdersUpdater',
  // 'FeesUpdater',
  // 'useGetInitialPrice',
  // 'useFetchTwapOrdersFromSafe',
]

/**
 *  Hook to execute a function periodically. The function will not execute if the window is not visible
 *
 * @param params Parameters to configure the polling
 */
export function useInterval(params: UseIntervalParams): void {
  const { callback, delay, triggerEagerly = false, name } = params
  const isWindowVisible = useIsWindowVisible()
  const savedCallback = useRef<() => void>()

  // Remember the latest callback.
  useEffect(() => (savedCallback.current = callback), [callback])
  useEffect(() => {
    // console.debug(`[useInterval:${name}] Setup`, { isWindowVisible })

    function executeCallBack() {
      try {
        const { current: currentCallback } = savedCallback
        if (!currentCallback) {
          console.debug(`[useInterval:${name}] Do nothing`)
          return
        }
        console.debug(`[useInterval:${name}] Execute callback`)
        currentCallback && currentCallback()
      } catch (e) {
        console.error(`[useInterval:${name}] Error executing callback`, e)
      }
    }

    if (!isWindowVisible || !delay || !NAMES.includes(name)) {
      // console.debug(`[useInterval:${name}] No need to schedule interval`)
      return
    }

    console.debug(`[useInterval:${name}] Schedule interval`)
    const intervalId = setInterval(executeCallBack, delay)

    if (triggerEagerly) {
      executeCallBack()
    }
    return () => clearInterval(intervalId)
  }, [delay, triggerEagerly, name, isWindowVisible])
}
