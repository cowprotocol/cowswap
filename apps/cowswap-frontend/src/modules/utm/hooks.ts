import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { waitForAnalytics } from '@cowprotocol/analytics'
import { getUtmParams, cleanUpUtmParams, UtmParams } from '@cowprotocol/common-utils'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { utmAtom } from './state'

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

/**
 * Handle URL navigation and cleanup after UTM processing
 */
function handleUrlNavigation(
  newSearch: string,
  hasQueryParamsOutOfHashbang: boolean,
  navigate: ReturnType<typeof useNavigate>,
  pathname: string,
  hash: string,
): void {
  const { href, origin, pathname: locationPath, hash: locationHash, search: locationSearch } = window.location

  if (hasQueryParamsOutOfHashbang) {
    window.location.replace(newSearch ? `/#${locationPath}?${newSearch}` : '/')
    return
  }

  const validHref = `${origin}${locationPath}${locationHash}${locationSearch}`
  const isWeirdURl = href !== validHref

  // Example: http://localhost:3000?
  if (isWeirdURl) {
    window.location.href = validHref
    return
  }

  navigate({ pathname, search: newSearch, hash }, { replace: true })
}

export function useInitializeUtm(): void {
  const navigate = useNavigate()
  const { search, pathname, hash } = useLocation()

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useLayoutEffect(
    () => {
      const hasQueryParamsOutOfHashbang = !search && window.location.search
      const searchParams = new URLSearchParams(search || window.location.search)
      const utm = getUtmParams(searchParams)

      if (Object.values(utm).filter(Boolean).length > 0) {
        // Only overrides the UTM if the URL includes at least one UTM param
        setUtm(utm)

        // Wait for analytics to be ready before cleaning up UTM parameters
        waitForAnalytics().then(() => {
          // Small additional delay to ensure analytics has captured the parameters
          setTimeout(() => {
            const newSearchParams = cleanUpUtmParams(new URLSearchParams(search || window.location.search))
            const newSearch = newSearchParams.toString()

            handleUrlNavigation(newSearch, !!hasQueryParamsOutOfHashbang, navigate, pathname, hash)
          }, 250) // Additional 250ms delay for analytics capture
        })
      } else {
        // No UTM parameters, proceed with normal cleanup immediately
        const newSearchParams = cleanUpUtmParams(searchParams)
        const newSearch = newSearchParams.toString()

        handleUrlNavigation(newSearch, !!hasQueryParamsOutOfHashbang, navigate, pathname, hash)
      }
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
