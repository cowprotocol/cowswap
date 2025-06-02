import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

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

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(() => {
    const query = new URLSearchParams(searchParams?.toString())
    const utm = getUtmParams(query)

    if (hasUtmCodes(utm)) {
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
      // No UTM parameters, proceed with normal cleanup immediately
      cleanUpParams(router, pathname, query)
    }
  }, [router, setUtm, pathname, searchParams])
}
