import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

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
    // Preserve the hash content (the actual route) when moving UTM params from main URL to hash
    const hashContent = locationHash.startsWith('#') ? locationHash.substring(1) : locationHash
    const finalUrl = newSearch ? `/#${hashContent}?${newSearch}` : `/${locationHash}`
    window.location.replace(finalUrl)
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
  const hasProcessedUtm = useRef(false)

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useLayoutEffect(
    () => {
      // Prevent multiple runs of UTM processing
      if (hasProcessedUtm.current) {
        return
      }

      const hasQueryParamsOutOfHashbang = !search && window.location.search
      const searchParams = new URLSearchParams(search || window.location.search)
      const utm = getUtmParams(searchParams)
      const hasUtmParams = Object.values(utm).filter(Boolean).length > 0

      if (hasUtmParams) {
        // Mark as processed to prevent re-runs
        hasProcessedUtm.current = true

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
        // Check if we need to clean up any remaining UTM parameters
        const newSearchParams = cleanUpUtmParams(searchParams)
        const newSearch = newSearchParams.toString()

        // Only navigate if there's actually a change needed
        const currentSearch = searchParams.toString()
        if (newSearch !== currentSearch) {
          hasProcessedUtm.current = true
          handleUrlNavigation(newSearch, !!hasQueryParamsOutOfHashbang, navigate, pathname, hash)
        }
      }
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
