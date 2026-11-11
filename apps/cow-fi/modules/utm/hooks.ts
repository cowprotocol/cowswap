import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { waitForAnalytics } from '@cowprotocol/analytics'
import { getUtmParams, hasUtmCodes, UtmParams } from '@cowprotocol/common-utils'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { utmAtom } from './state'
import { cleanUpParams } from './utils'

export function useInitializeUtm(): void {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentLocation = useRef({ pathname, searchParams })
  currentLocation.current = { pathname, searchParams }

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const query = new URLSearchParams(searchParams?.toString())
    const utm = getUtmParams(query)

    if (hasUtmCodes(utm)) {
      // Only overrides the UTM if the URL includes at least one UTM param
      setUtm(utm)

      // Wait for analytics to be ready before cleaning up UTM parameters
      waitForAnalytics().then(() => {
        if (cancelled) return

        timeoutId = setTimeout(() => {
          const { pathname, searchParams } = currentLocation.current
          cleanUpParams(router, pathname, new URLSearchParams(searchParams?.toString()))
        }, 250) // Additional 250ms delay for analytics capture
      })
    } else {
      // Check if we need to clean up any remaining UTM parameters
      // cleanUpParams already checks if there are changes before navigating
      const hasUtmToClean = Array.from(query.keys()).some((key) => key.startsWith('utm_'))
      if (hasUtmToClean) {
        cleanUpParams(router, pathname, query)
      }
    }
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - we only want this to run once on mount
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}
