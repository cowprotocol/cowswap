import useIsWindowVisible from '@src/hooks/useIsWindowVisible'
import { useCallback, useEffect } from 'react'

export interface UsePollingParams {
  doPolling: () => void
  pollingTimeMs: number
  triggerEagerly?: boolean
  name: string // Just for debugging porpouses
}

export function usePolling(params: UsePollingParams) {
  const { doPolling: doPollingImpl, pollingTimeMs, triggerEagerly = true, name } = params
  const isWindowVisible = useIsWindowVisible()

  const doPolling = useCallback(() => {
    console.debug(`[usePolling][${name}] Executing polling function`)
    doPollingImpl()
  }, [doPollingImpl, name])

  useEffect(() => {
    if (!isWindowVisible) {
      console.debug(`[usePolling][${name}] No need to do polling`)
      return
    }

    console.debug(`[usePolling][${name}] Schedule polling`)
    const intervalId = setInterval(doPolling, pollingTimeMs)

    if (triggerEagerly) {
      doPolling()
    }
    return () => clearInterval(intervalId)
  }, [doPolling, pollingTimeMs, triggerEagerly, name, isWindowVisible])
}
