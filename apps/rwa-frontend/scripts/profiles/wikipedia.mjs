import { fetchWithRetry, WIKIMEDIA_USER_AGENT } from './http.mjs'

const API_URL = 'https://en.wikipedia.org/w/api.php'
/** TextExtracts caps intro extracts at 20 pages per request */
const BATCH_SIZE = 20
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000]

/** The intro text of a regular article; `null` for missing pages, disambiguation pages and empty extracts */
export function toSourceText(page) {
  if (page.missing || page.pageprops?.disambiguation !== undefined || !page.extract) return null

  return page.extract
}

/** Maps each requested title to its page title, following normalization (`_` to space) and redirects */
export function resolveTitles(titles, query) {
  const renames = new Map([...(query.normalized ?? []), ...(query.redirects ?? [])].map(({ from, to }) => [from, to]))

  return new Map(
    titles.map((title) => {
      let resolved = title
      for (let hops = 0; renames.has(resolved) && hops < 3; hops++) resolved = renames.get(resolved)

      return [title, resolved]
    }),
  )
}

/** Article title to intro text, for the titles with a usable article */
export async function fetchSourceTexts(articleTitles, onProgress = () => {}) {
  const titles = [...new Set(articleTitles)]
  const texts = new Map()

  for (let start = 0; start < titles.length; start += BATCH_SIZE) {
    const batch = titles.slice(start, start + BATCH_SIZE)
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      prop: 'extracts|pageprops',
      ppprop: 'disambiguation',
      exintro: '1',
      explaintext: '1',
      exlimit: String(BATCH_SIZE),
      redirects: '1',
      titles: batch.join('|'),
    })
    const response = await fetchWithRetry(
      `${API_URL}?${params}`,
      { headers: { accept: 'application/json', 'user-agent': WIKIMEDIA_USER_AGENT } },
      RETRY_DELAYS_MS,
    )
    if (!response.ok) throw new Error(`Wikipedia extracts: HTTP ${response.status}`)

    const { query } = await response.json()
    const pages = new Map(query.pages.map((page) => [page.title, page]))

    for (const [title, resolved] of resolveTitles(batch, query)) {
      const page = pages.get(resolved)
      const text = page ? toSourceText(page) : null
      if (text) texts.set(title, text)
    }
    onProgress(start + batch.length, titles.length)
  }

  return texts
}
