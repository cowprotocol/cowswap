import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { utmAtom } from './state'
import { UtmParams } from './types'

const UTM_SOURCE_PARAMS: UtmParams = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
}

const ALL_UTM_PARAMS = Object.values(UTM_SOURCE_PARAMS)

function getUtmParams(searchParams: URLSearchParams): UtmParams {
  return Object.keys(UTM_SOURCE_PARAMS).reduce<UtmParams>((acc, _key) => {
    const key = _key as keyof UtmParams

    acc[key] = searchParams.get(UTM_SOURCE_PARAMS[key] as string) || undefined

    return acc
  }, {})
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

function cleanUpParams(searchParams: URLSearchParams): URLSearchParams {
  ALL_UTM_PARAMS.forEach((param) => {
    if (searchParams.has(param)) {
      searchParams.delete(param)
    }
  })

  return searchParams
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

      const { href, origin, pathname: locationPath, hash: locationHash, search: locationSearch } = window.location

      if (Object.values(utm).filter(Boolean).length > 0) {
        // Only overrides the UTM if the URL includes at least one UTM param
        setUtm(utm)
      }

      const newSearch = cleanUpParams(searchParams).toString()

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
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
