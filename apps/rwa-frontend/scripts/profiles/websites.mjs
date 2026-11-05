import { fetchWithRetry, WIKIMEDIA_USER_AGENT } from './http.mjs'

const SPARQL_URL = 'https://query.wikidata.org/sparql'
const BATCH_SIZE = 200
const RETRY_DELAYS_MS = [1000, 2000, 4000]
const MAX_URL_LENGTH = 200
const ENGLISH = 'Q1860'
/** Characters that have no place in a website link and could break out of an attribute or a script context */
const UNSAFE_CHARACTERS = /[\s"'<>`\\{}|^\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/u
const HOSTNAME_LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/

/**
 * The official website as the app should link it: `https` origin and path, without credentials, port, query or
 * fragment. Throws with the reason when the value isn't a plain public `https` link.
 */
export function sanitizeWebsite(value) {
  if (typeof value !== 'string') throw new Error('not a string')

  const raw = value.trim()
  if (!raw) throw new Error('empty')
  if (raw.length > MAX_URL_LENGTH) throw new Error(`longer than ${MAX_URL_LENGTH} characters`)
  if (UNSAFE_CHARACTERS.test(raw)) throw new Error('unsafe characters')
  if (!URL.canParse(raw)) throw new Error('not a URL')

  const url = new URL(raw)
  if (url.protocol !== 'https:') throw new Error(`${url.protocol.slice(0, -1)} instead of https`)
  if (url.username || url.password) throw new Error('credentials in URL')
  if (url.port) throw new Error('custom port')

  const labels = url.hostname.split('.')
  if (labels.length < 2 || !labels.every((label) => HOSTNAME_LABEL.test(label))) throw new Error('invalid hostname')
  if (/^\d+$/.test(labels[labels.length - 1])) throw new Error('IP address')
  if (labels.some((label) => label.startsWith('xn--'))) throw new Error('internationalized hostname')

  const path = url.pathname.replace(/\/+$/, '')
  if (/%(?![0-9a-f]{2})/i.test(path)) throw new Error('invalid percent-encoding')

  return `https://${url.hostname}${path}`
}

export function buildWebsiteQuery(items) {
  return `SELECT ?item ?website ?rank ?language WHERE {
  VALUES ?item { ${items.map((item) => `wd:${item}`).join(' ')} }
  ?item p:P856 ?statement.
  ?statement ps:P856 ?website; wikibase:rank ?rank.
  FILTER(?rank != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?statement pq:P582 ?endTime. }
  OPTIONAL { ?statement pq:P407 ?language. }
}`
}

/**
 * Wikidata item to its website: the preferred-rank values if any, then the English or language-less ones. Items
 * whose remaining values sanitize to different links are `ambiguous`; items with only unusable values are `rejected`.
 */
export function pickWebsites(bindings) {
  const statementsByItem = new Map()
  for (const binding of bindings) {
    const item = entityId(binding.item.value)
    const statement = {
      website: binding.website.value,
      preferred: binding.rank.value.endsWith('PreferredRank'),
      language: binding.language ? entityId(binding.language.value) : null,
    }
    statementsByItem.set(item, [...(statementsByItem.get(item) ?? []), statement])
  }

  const results = new Map()
  for (const [item, statements] of statementsByItem) results.set(item, pickWebsite(statements))

  return results
}

/** Wikidata item to `{ website }`, `{ ambiguous: [...] }` or `{ rejected: [...] }`, for items that have a website */
export async function fetchWebsites(items, onProgress = () => {}) {
  const ids = [...new Set(items)]
  const results = new Map()

  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = ids.slice(start, start + BATCH_SIZE)
    const response = await fetchWithRetry(
      SPARQL_URL,
      {
        method: 'POST',
        headers: {
          accept: 'application/sparql-results+json',
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent': WIKIMEDIA_USER_AGENT,
        },
        body: new URLSearchParams({ query: buildWebsiteQuery(batch), format: 'json' }),
      },
      RETRY_DELAYS_MS,
    )
    if (!response.ok) throw new Error(`Wikidata SPARQL: HTTP ${response.status} ${await response.text()}`)

    const { results: sparql } = await response.json()
    for (const [item, result] of pickWebsites(sparql.bindings)) results.set(item, result)
    onProgress(start + batch.length, ids.length)
  }

  return results
}

function pickWebsite(statements) {
  const preferred = statements.filter((statement) => statement.preferred)
  const ranked = preferred.length ? preferred : statements
  const english = ranked.filter((statement) => !statement.language || statement.language === ENGLISH)
  const candidates = english.length ? english : ranked

  const websites = new Set()
  const rejected = []
  for (const { website } of candidates) {
    try {
      websites.add(sanitizeWebsite(website))
    } catch (err) {
      rejected.push(`${JSON.stringify(website)}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (websites.size === 1) return { website: [...websites][0] }
  if (websites.size > 1) return { ambiguous: [...websites] }

  return { rejected }
}

function entityId(uri) {
  return uri.slice(uri.lastIndexOf('/') + 1)
}
