import { fetchWithTimeout, normalizeError } from '@cowprotocol/common-utils'

const EXAMPLE_TIMEOUT_MESSAGE = 'A visual example took too long to load. Please try again.'

export async function loadExampleAsset(path: string): Promise<Blob> {
  try {
    const response = await fetchWithTimeout(path, { timeout: 10000, timeoutMessage: EXAMPLE_TIMEOUT_MESSAGE })
    if (!response.ok) throw new Error('A visual example could not be loaded. Try again.')
    return await response.blob()
  } catch (err: unknown) {
    const error = normalizeError(err)
    if (error.name === 'AbortError') throw new Error(EXAMPLE_TIMEOUT_MESSAGE)
    throw error
  }
}
