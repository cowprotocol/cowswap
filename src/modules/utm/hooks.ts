import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { utmAtom } from './state'
import { UtmParams } from './types'

const UTM_SOURCE_PARAM = 'utm_source'
const UTM_MEDIUM_PARAM = 'utm_medium'
const UTM_CAMPAIGN_PARAM = 'utm_campaign'
const UTM_CONTENT_PARAM = 'utm_content'
const UTM_TERM_PARAM = 'utm_term'

const ALL_UTM_PARAMS = [UTM_SOURCE_PARAM, UTM_MEDIUM_PARAM, UTM_CAMPAIGN_PARAM, UTM_CONTENT_PARAM, UTM_TERM_PARAM]

function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utmSource = searchParams.get(UTM_SOURCE_PARAM) || undefined
  const utmMedium = searchParams.get(UTM_MEDIUM_PARAM) || undefined
  const utmCampaign = searchParams.get(UTM_CAMPAIGN_PARAM) || undefined
  const utmContent = searchParams.get(UTM_CONTENT_PARAM) || undefined
  const utmTerm = searchParams.get(UTM_TERM_PARAM) || undefined

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  }
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

function cleanUpParams(searchParams: URLSearchParams): boolean {
  let cleanedParams = false
  ALL_UTM_PARAMS.forEach((param) => {
    if (searchParams.has(param)) {
      searchParams.delete(param)
      cleanedParams = true
    }
  })

  return cleanedParams
}

export function useInitializeUtm(): void {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(search)
      const utm = getUtmParams(searchParams)
      if (utm.utmSource || utm.utmMedium || utm.utmCampaign || utm.utmContent || utm.utmTerm) {
        // Only overrides the UTM if the URL includes at least one UTM param
        setUtm(utm)
      }

      // Clear params from URL and redirect
      const cleanedParams = cleanUpParams(searchParams)
      if (cleanedParams) {
        navigate({ pathname, search: searchParams.toString() }, { replace: true })
      }
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
