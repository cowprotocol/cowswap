import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { utmAtom } from './state'
import { UtmParams } from './types'
import { cleanUpParams, getUtmParams, hasUtmCodes } from './utils'
import { usePathname } from 'next/dist/client/components/navigation'

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
    }

    // Clear params from URL and redirect
    cleanUpParams(router, pathname, query)
  }, [router, setUtm])
}
