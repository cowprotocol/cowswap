import { fetchWithRetry, WIKIMEDIA_USER_AGENT } from './http.mjs'

export const EXCHANGES = {
  nyse: 'Q13677',
  nasdaq: 'Q82059',
  nyseArca: 'Q10593835',
  nyseAmerican: 'Q846626',
  hkex: 'Q496672',
  lse: 'Q171240',
}

const US_EXCHANGES = [EXCHANGES.nyse, EXCHANGES.nasdaq, EXCHANGES.nyseArca, EXCHANGES.nyseAmerican]
const SPARQL_URL = 'https://query.wikidata.org/sparql'
const BATCH_SIZE = 200
const RETRY_DELAYS_MS = [1000, 2000, 4000]

/** Registry ticker to the symbols and exchanges it is listed with on Wikidata (`P414` / `P249`) */
export function toWikidataTicker(ticker) {
  if (ticker.endsWith('.HK')) {
    const code = ticker.slice(0, -3).replace(/^0+/, '')
    return { symbols: [code, code.padStart(4, '0')].filter(unique), exchanges: [EXCHANGES.hkex] }
  }
  if (ticker.endsWith('.L')) return { symbols: [ticker.slice(0, -2)], exchanges: [EXCHANGES.lse] }
  if (ticker.includes('.')) return { symbols: [ticker, ticker.replace('.', '-')], exchanges: US_EXCHANGES }

  return { symbols: [ticker], exchanges: US_EXCHANGES }
}

export function buildSparqlQuery(tickers) {
  const pairs = tickers.flatMap((ticker) => {
    const { symbols, exchanges } = toWikidataTicker(ticker)
    return symbols.flatMap((symbol) => exchanges.map((exchange) => `(${JSON.stringify(symbol)} wd:${exchange})`))
  })

  return `SELECT ?symbol ?exchange ?item ?article ?industryLabel WHERE {
  VALUES (?symbol ?exchange) { ${pairs.join(' ')} }
  ?item p:P414 ?listing.
  ?listing pq:P249 ?symbol; ps:P414 ?exchange; wikibase:rank ?rank.
  FILTER(?rank != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?listing pq:P582 ?endTime. }
  OPTIONAL { ?item wdt:P452 ?industry. }
  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`
}

/**
 * Registry ticker to its Wikidata entity. A ticker listed by more than one entity is left out: guessing would put
 * another company's text on the asset.
 */
export function matchEntities(tickers, bindings) {
  const tickerBySymbol = new Map()
  for (const ticker of tickers) {
    const { symbols, exchanges } = toWikidataTicker(ticker)
    for (const symbol of symbols) tickerBySymbol.set(symbolKey(symbol, exchanges), ticker)
  }

  const bindingsByTicker = new Map()
  for (const binding of bindings) {
    const ticker = findTicker(tickerBySymbol, binding)
    if (!ticker) continue
    bindingsByTicker.set(ticker, [...(bindingsByTicker.get(ticker) ?? []), binding])
  }

  const matches = new Map()
  for (const [ticker, tickerBindings] of bindingsByTicker) {
    const items = tickerBindings.map((binding) => entityId(binding.item.value)).filter(unique)
    if (items.length !== 1) continue

    const article = tickerBindings.find((binding) => binding.article)?.article.value
    const industry = tickerBindings.find((binding) => binding.industryLabel)?.industryLabel.value

    matches.set(ticker, {
      item: items[0],
      articleTitle: article ? decodeURIComponent(article.split('/wiki/')[1]) : null,
      industry: industry ?? null,
    })
  }

  return matches
}

export async function fetchWikidataMatches(tickers) {
  const matches = new Map()

  for (let start = 0; start < tickers.length; start += BATCH_SIZE) {
    const batch = tickers.slice(start, start + BATCH_SIZE)
    const response = await fetchWithRetry(
      SPARQL_URL,
      {
        method: 'POST',
        headers: {
          accept: 'application/sparql-results+json',
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent': WIKIMEDIA_USER_AGENT,
        },
        body: new URLSearchParams({ query: buildSparqlQuery(batch), format: 'json' }),
      },
      RETRY_DELAYS_MS,
    )
    if (!response.ok) throw new Error(`Wikidata SPARQL: HTTP ${response.status} ${await response.text()}`)

    const { results } = await response.json()
    for (const [ticker, match] of matchEntities(batch, results.bindings)) matches.set(ticker, match)
  }

  return matches
}

function findTicker(tickerBySymbol, binding) {
  const symbol = binding.symbol.value
  const exchange = binding.exchange ? entityId(binding.exchange.value) : undefined

  for (const [key, ticker] of tickerBySymbol) {
    const [keySymbol, keyExchanges] = key.split('|')
    if (keySymbol === symbol && (!exchange || keyExchanges.split(',').includes(exchange))) return ticker
  }

  return undefined
}

function symbolKey(symbol, exchanges) {
  return `${symbol}|${exchanges.join(',')}`
}

function entityId(uri) {
  return uri.slice(uri.lastIndexOf('/') + 1)
}

function unique(value, index, values) {
  return values.indexOf(value) === index
}
