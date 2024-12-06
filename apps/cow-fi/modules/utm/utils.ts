import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

const UTM_SOURCE_PARAM = 'utm_source'
const UTM_MEDIUM_PARAM = 'utm_medium'
const UTM_CAMPAIGN_PARAM = 'utm_campaign'
const UTM_CONTENT_PARAM = 'utm_content'
const UTM_TERM_PARAM = 'utm_term'

const ALL_UTM_PARAMS = [UTM_SOURCE_PARAM, UTM_MEDIUM_PARAM, UTM_CAMPAIGN_PARAM, UTM_CONTENT_PARAM, UTM_TERM_PARAM]

import { UtmParams } from './types'
import { CONFIG } from '@/const/meta'

export function getUtmParams(query: URLSearchParams): UtmParams {
  const utmSource = (query.get(UTM_SOURCE_PARAM) as string) || undefined
  const utmMedium = (query.get(UTM_MEDIUM_PARAM) as string) || undefined
  const utmCampaign = (query.get(UTM_CAMPAIGN_PARAM) as string) || undefined
  const utmContent = (query.get(UTM_CONTENT_PARAM) as string) || undefined
  const utmTerm = (query.get(UTM_TERM_PARAM) as string) || undefined

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  }
}

export function cleanUpParams(router: AppRouterInstance, pathname: string | null, query: URLSearchParams) {
  let cleanedParams = false

  ALL_UTM_PARAMS.forEach((param) => {
    if (query.get(param)) {
      query.delete(param)
      cleanedParams = true
    }
  })

  if (cleanedParams) {
    router.replace((pathname || '/') + '?' + query.toString())
  }
}

export function hasUtmCodes(utm: UtmParams | undefined): boolean {
  if (!utm) return false

  return !!(utm.utmSource || utm.utmCampaign || utm.utmContent || utm.utmMedium || utm.utmTerm)
}

export function addUtmToUrl(href: string, utm: UtmParams): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : CONFIG.url.root
  const url = new URL(href, origin)

  // Extract the hash and its associated query parameters
  const [hashPath, hashQuery] = url.hash.split('?')

  // Create a new URLSearchParams object for the hash's query parameters
  const hashParams = new URLSearchParams(hashQuery)

  // Add UTM parameters to the hash's query parameters
  if (utm.utmCampaign) {
    hashParams.set(UTM_CAMPAIGN_PARAM, utm.utmCampaign)
  }

  if (utm.utmContent) {
    hashParams.set(UTM_CONTENT_PARAM, utm.utmContent)
  }

  if (utm.utmMedium) {
    hashParams.set(UTM_MEDIUM_PARAM, utm.utmMedium)
  }

  if (utm.utmSource) {
    hashParams.set(UTM_SOURCE_PARAM, utm.utmSource)
  }

  if (utm.utmTerm) {
    hashParams.set(UTM_TERM_PARAM, utm.utmTerm)
  }

  // Construct the final URL
  const baseUrl = url.origin + url.pathname + url.search
  const finalHash = `${hashPath}?${hashParams.toString()}`
  return baseUrl + finalHash
}
