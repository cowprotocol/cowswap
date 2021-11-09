import ms from 'ms.macro'
import { useState, useEffect } from 'react'

export type GpQuoteStatus = 'COWSWAP' | 'LEGACY'
// TODO: use actual API call
export async function checkGpQuoteApiStatus(): Promise<GpQuoteStatus> {
  return new Promise((accept) => setTimeout(() => accept('LEGACY'), 500))
}
const GP_QUOTE_STATUS_INTERVAL_TIME = ms`2 hours`

export default function useCheckGpQuoteStatus(defaultApiToUse: GpQuoteStatus): GpQuoteStatus {
  const [gpQuoteApiStatus, setGpQuoteApiStatus] = useState<GpQuoteStatus>(defaultApiToUse)

  useEffect(() => {
    console.debug('[useGetQuoteCallback::GP API Status]::', gpQuoteApiStatus)

    const checkStatus = () => {
      checkGpQuoteApiStatus()
        .then(setGpQuoteApiStatus)
        .catch((err: Error) => {
          console.error('[useGetQuoteCallback::useEffect] Error getting GP quote status::', err)
          // Fallback to LEGACY
          setGpQuoteApiStatus('LEGACY')
        })
    }

    // Create initial call on mount
    checkStatus()

    // set interval for GP_QUOTE_STATUS_INTERVAL_TIME (2 hours)
    const intervalId = setInterval(() => {
      checkStatus()
    }, GP_QUOTE_STATUS_INTERVAL_TIME)

    return () => clearInterval(intervalId)
  }, [gpQuoteApiStatus])

  return gpQuoteApiStatus
}
