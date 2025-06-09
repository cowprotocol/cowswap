import { ReactNode } from 'react'

import { isDevelopmentEnv } from '@cowprotocol/common-utils'

import { ERROR_MESSAGES } from '../pure/AddCustomHookForm/constants'

interface ValidationResult {
  isValid: boolean
  error: string | ReactNode | null
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function validateHookDappUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: null }
  }

  // Check for spaces in the URL (except leading/trailing which we'll trim)
  if (url.trim() !== url.trim().replace(/\s+/g, '')) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_URL_SPACES }
  }

  // Trim the URL to handle trailing spaces
  const trimmedUrl = url.trim()

  try {
    const urlObject = new URL(trimmedUrl)

    // Normalize and validate the pathname
    const normalizedPath = urlObject.pathname.replace(/\/+/g, '/')
    if (normalizedPath !== urlObject.pathname) {
      return { isValid: false, error: ERROR_MESSAGES.INVALID_URL_SLASHES }
    }

    const isLocalhost = urlObject.hostname === 'localhost' || urlObject.hostname === '127.0.0.1'
    const isHttps = urlObject.protocol.startsWith('https')

    // In production, always require HTTPS except for localhost in development
    if (!isDevelopmentEnv() && !isLocalhost && !isHttps) {
      return { isValid: false, error: ERROR_MESSAGES.HTTPS_REQUIRED }
    }

    // Handle common URL mistakes
    if (urlObject.pathname === '/manifest.json') {
      return { isValid: false, error: ERROR_MESSAGES.MANIFEST_PATH }
    }

    return { isValid: true, error: null }
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { isValid: false, error: ERROR_MESSAGES.MANIFEST_NOT_FOUND }
    }
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_URL_FORMAT(error as Error),
    }
  }
}
