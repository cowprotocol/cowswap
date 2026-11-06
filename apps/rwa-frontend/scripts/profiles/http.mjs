export const WIKIMEDIA_USER_AGENT = 'cowswap-rwa-registry/1.0 (https://github.com/cowprotocol/cowswap)'

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504, 529])
const DEFAULT_TIMEOUT_MS = 120_000

/**
 * `fetch` that retries network errors and `RETRY_STATUSES` after each of `delaysMs`.
 * Any other response is returned as is. Each attempt, including reading the response body, aborts after `timeoutMs`.
 */
export async function fetchWithRetry(url, init, delaysMs, timeoutMs = DEFAULT_TIMEOUT_MS) {
  for (let attempt = 0; ; attempt++) {
    const delayMs = delaysMs[attempt]

    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
      if (!RETRY_STATUSES.has(response.status) || delayMs === undefined) return response
      console.warn(`${new URL(url).host}: HTTP ${response.status}, retrying in ${delayMs / 1000}s`)
    } catch (error) {
      if (delayMs === undefined) throw error
      console.warn(
        `${new URL(url).host}: ${error instanceof Error ? error.message : String(error)}, retrying in ${delayMs / 1000}s`,
      )
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}
