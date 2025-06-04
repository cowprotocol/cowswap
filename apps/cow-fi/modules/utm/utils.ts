import { UtmParams, utmParamsToUrlParams } from '@cowprotocol/common-utils'

import { CONFIG } from '@/const/meta'

// Using a generic router interface since AppRouterInstance is not exported
interface AppRouterInstance {
  replace: (url: string) => void
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

export function addUtmToUrl(href: string, utm: UtmParams): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : CONFIG.url.root
  const url = new URL(href, origin)

  // Extract the hash and its associated query parameters
  const [hashPath, hashQuery] = url.hash.split('?')

  // Create a new URLSearchParams object for the hash's query parameters
  const hashParams = new URLSearchParams(hashQuery)

  // Convert UTM parameters to URL format and add to hash parameters
  const urlParams = utmParamsToUrlParams(utm)
  Object.entries(urlParams).forEach(([key, value]) => {
    hashParams.set(key, value)
  })

  // Construct the final URL
  const baseUrl = url.origin + url.pathname + url.search
  const finalHash = `${hashPath}?${hashParams.toString()}`
  return baseUrl + finalHash
}
