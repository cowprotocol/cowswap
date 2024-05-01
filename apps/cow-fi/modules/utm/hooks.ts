import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useRouter } from 'next/router'

import { utmAtom } from './state'
import { UtmParams } from './types'
import { cleanUpParams, getUtmParams, hasUtmCodes } from './utils'

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

export function useInitializeUtm(): void {
  const router = useRouter()

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(() => {
    const utm = getUtmParams(router.query)
    if (hasUtmCodes(utm)) {
      // Only overrides the UTM if the URL includes at least one UTM param
      setUtm(utm)
    }

    // Clear params from URL and redirect
    cleanUpParams(router)
  }, [router, setUtm])
}
