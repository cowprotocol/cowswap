import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { waitForAnalytics } from '@cowprotocol/analytics'
import { getUtmParams, hasUtmCodes, UtmParams } from '@cowprotocol/common-utils'

import { useSearchParams, useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

import { utmAtom } from './state'
import { cleanUpParams } from './utils'

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

export function useInitializeUtm(): void {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasProcessedUtm = useRef(false)

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(() => {
    // Prevent multiple runs of UTM processing
    if (hasProcessedUtm.current) {
      return
    }

    const query = new URLSearchParams(searchParams?.toString())
    const utm = getUtmParams(query)

    if (hasUtmCodes(utm)) {
      // Mark as processed to prevent re-runs
      hasProcessedUtm.current = true

      // Only overrides the UTM if the URL includes at least one UTM param
      setUtm(utm)

      // Wait for analytics to be ready before cleaning up UTM parameters
      waitForAnalytics().then(() => {
        // Small additional delay to ensure analytics has captured the parameters
        setTimeout(() => {
          cleanUpParams(router, pathname, new URLSearchParams(searchParams?.toString()))
        }, 250) // Additional 250ms delay for analytics capture
      })
    } else {
      // Check if we need to clean up any remaining UTM parameters
      // cleanUpParams already checks if there are changes before navigating
      const hasUtmToClean = Array.from(query.keys()).some((key) => key.startsWith('utm_'))
      if (hasUtmToClean) {
        hasProcessedUtm.current = true
        cleanUpParams(router, pathname, query)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - we only want this to run once on mount
}
