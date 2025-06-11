/**
 * UTM Parameter Utilities
 * Provides consistent UTM parameter handling across all CoW applications
 */

export interface UtmParams {
  // Common UTM parameters (for backwards compatibility and IDE autocompletion)
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  utmCode?: string
  // Allow any other utm_* parameter for future extensibility
  [key: string]: string | undefined
}

/**
 * Extract all UTM parameters from URL search params
 * Captures any parameter starting with 'utm_' for maximum flexibility
 *
 * @param searchParams - URLSearchParams object to extract from
 * @returns UtmParams object with camelCase properties
 */
export function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utmParams: UtmParams = {}

  // Iterate through all URL parameters and capture utm_* ones
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('utm_') && value) {
      // Convert utm_source to utmSource, utm_medium to utmMedium, etc.
      const camelCaseKey = key.replace(/^utm_/, '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const propertyKey = `utm${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`
      utmParams[propertyKey] = value
    }
  }

  return utmParams
}

/**
 * Check if UTM parameters exist and have values
 *
 * @param utm - UtmParams object to check
 * @returns true if any UTM parameter has a value
 */
export function hasUtmCodes(utm: UtmParams | undefined): boolean {
  if (!utm) return false

  // Check if any property starting with 'utm' has a value
  return Object.keys(utm).some((key) => key.startsWith('utm') && !!utm[key])
}

/**
 * Remove all utm_* parameters from URLSearchParams
 *
 * @param searchParams - URLSearchParams object to clean
 * @returns new URLSearchParams with UTM parameters removed
 */
export function cleanUpUtmParams(searchParams: URLSearchParams): URLSearchParams {
  // Create a copy to avoid mutating the original URLSearchParams
  const cleanParams = new URLSearchParams(searchParams)

  // Remove all utm_* parameters
  const paramsToDelete: string[] = []
  for (const [key] of cleanParams.entries()) {
    if (key.startsWith('utm_')) {
      paramsToDelete.push(key)
    }
  }

  paramsToDelete.forEach((param) => cleanParams.delete(param))
  return cleanParams
}

/**
 * Convert UTM parameters back to URL format
 * Useful for adding UTM parameters to URLs
 *
 * @param utm - UtmParams object with camelCase properties
 * @returns Record of URL parameter names to values
 */
export function utmParamsToUrlParams(utm: UtmParams): Record<string, string> {
  const urlParams: Record<string, string> = {}

  Object.keys(utm).forEach((key) => {
    if (key.startsWith('utm') && utm[key]) {
      // Convert utmSource to utm_source, utmMedium to utm_medium, etc.
      const urlParam = key
        .replace(/^utm/, 'utm_')
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
      urlParams[urlParam] = utm[key]!
    }
  })

  return urlParams
}
