import { getTimeoutAbortController } from '@cowprotocol/common-utils'

export const TIMEOUT_ERROR_MESSAGE = 'Request timed out. Please try again.'

interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number
}

export async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}) {
  try {
    const { timeout = 30000, ...fetchOptions } = options
    const response = await fetch(url, {
      signal: getTimeoutAbortController(timeout).signal,
      ...fetchOptions,
    })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(TIMEOUT_ERROR_MESSAGE)
    }
    throw error
  }
}
