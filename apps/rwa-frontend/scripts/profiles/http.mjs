export const WIKIMEDIA_USER_AGENT = 'cowswap-rwa-registry/1.0 (https://github.com/cowprotocol/cowswap)'

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504, 529])

/**
 * `fetch` that retries network errors and `RETRY_STATUSES` after each of `delaysMs`.
 * Any other response is returned as is.
 */
export async function fetchWithRetry(url, init, delaysMs) {
  for (let attempt = 0; ; attempt++) {
    const delayMs = delaysMs[attempt]

    try {
      const response = await fetch(url, init)
      if (!RETRY_STATUSES.has(response.status) || delayMs === undefined) return response
    } catch (error) {
      if (delayMs === undefined) throw error
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}
