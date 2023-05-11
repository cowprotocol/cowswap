import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { UtmParams } from './types'
import { useSetAtom } from 'jotai'
import { utmAtom } from './state'

function getUtcParams(searchParams: URLSearchParams): UtmParams {
  const utcSource = searchParams.get('utm_source') || undefined
  const utcMedium = searchParams.get('utm_medium') || undefined
  const utcCampaign = searchParams.get('utm_campaign') || undefined
  const utcContent = searchParams.get('utm_content') || undefined
  const utcTerm = searchParams.get('utm_term') || undefined

  return {
    utcSource,
    utcMedium,
    utcCampaign,
    utcContent,
    utcTerm,
  }
}

export function useInitializeUtm() {
  const location = useLocation()
  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(location.search)
      const utm = getUtcParams(searchParams)
      setUtm(utm)
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
