import { fetchWithRetry, WIKIMEDIA_USER_AGENT } from './http.mjs'

const SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const RETRY_DELAYS_MS = [1000, 2000, 4000]

/** The summary text of a regular article; `null` for disambiguation pages and empty extracts */
export function toSourceText(summary) {
  if (summary.type !== 'standard' || !summary.extract) return null

  return summary.extract
}

export async function fetchSourceText(articleTitle) {
  const response = await fetchWithRetry(
    `${SUMMARY_URL}${encodeURIComponent(articleTitle)}`,
    { headers: { accept: 'application/json', 'user-agent': WIKIMEDIA_USER_AGENT } },
    RETRY_DELAYS_MS,
  )
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Wikipedia summary "${articleTitle}": HTTP ${response.status}`)

  return toSourceText(await response.json())
}
