import { getTimeoutAbortController } from '../request'

export const TIMEOUT_ERROR_MESSAGE = 'Request timed out. Please try again.'

interface FetchTimeoutOptions extends RequestInit {
  timeout?: number
  timeoutMessage?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function fetchWithTimeout(url: string, options: FetchTimeoutOptions = {}) {
  const { timeout = 30000, timeoutMessage = TIMEOUT_ERROR_MESSAGE, ...fetchOptions } = options

  try {
    const response = await fetch(url, { signal: getTimeoutAbortController(timeout).signal, ...fetchOptions })
    return response
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(timeoutMessage)
    }
    throw error
  }
}
