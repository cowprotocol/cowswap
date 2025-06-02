import { CONFIG } from '@/const/meta'

import { UtmParams } from './types'

// Using a generic router interface since AppRouterInstance is not exported
interface AppRouterInstance {
  replace: (url: string) => void
}

/**
 * Extract all UTM parameters from URL search params
 * Captures any parameter starting with 'utm_'
 */
export function getUtmParams(query: URLSearchParams): UtmParams {
  const utmParams: UtmParams = {}

  // Iterate through all URL parameters and capture utm_* ones
  for (const [key, value] of query.entries()) {
    if (key.startsWith('utm_') && value) {
      // Convert utm_source to utmSource, utm_medium to utmMedium, etc.
      const camelCaseKey = key.replace(/^utm_/, '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const propertyKey = `utm${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`
      utmParams[propertyKey] = value
    }
  }

  return utmParams
}

export function cleanUpParams(router: AppRouterInstance, pathname: string | null, query: URLSearchParams) {
  let cleanedParams = false

  // Remove all utm_* parameters
  const paramsToDelete: string[] = []
  for (const [key] of query.entries()) {
    if (key.startsWith('utm_')) {
      paramsToDelete.push(key)
      cleanedParams = true
    }
  }

  paramsToDelete.forEach((param) => query.delete(param))

  if (cleanedParams) {
    router.replace((pathname || '/') + '?' + query.toString())
  }
}

export function hasUtmCodes(utm: UtmParams | undefined): boolean {
  if (!utm) return false

  // Check if any property starting with 'utm' has a value
  return Object.keys(utm).some((key) => key.startsWith('utm') && !!utm[key])
}

export function addUtmToUrl(href: string, utm: UtmParams): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : CONFIG.url.root
  const url = new URL(href, origin)

  // Extract the hash and its associated query parameters
  const [hashPath, hashQuery] = url.hash.split('?')

  // Create a new URLSearchParams object for the hash's query parameters
  const hashParams = new URLSearchParams(hashQuery)

  // Add all UTM parameters to the hash's query parameters
  Object.keys(utm).forEach((key) => {
    if (key.startsWith('utm') && utm[key]) {
      // Convert utmSource to utm_source, utmMedium to utm_medium, etc.
      const urlParam = key
        .replace(/^utm/, 'utm_')
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
      hashParams.set(urlParam, utm[key]!)
    }
  })

  // Construct the final URL
  const baseUrl = url.origin + url.pathname + url.search
  const finalHash = `${hashPath}?${hashParams.toString()}`
  return baseUrl + finalHash
}
