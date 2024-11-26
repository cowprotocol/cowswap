import { getTimeoutAbortController } from '../request'

interface FetchTimeoutOptions extends RequestInit {
  timeout: number
  timeoutMessage?: string
}

export async function fetchWithTimeout(url: string, options: FetchTimeoutOptions) {
  const { timeout, timeoutMessage, ...fetchOptions } = options

  try {
    const response = await fetch(url, { signal: getTimeoutAbortController(timeout).signal, ...fetchOptions })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(timeoutMessage || 'Request timeout')
    }
    throw error
  }
}
