#!/usr/bin/env node
/**
 * Rebuilds data/RWAs.json from the CoinGecko RWA API (https://docs.coingecko.com/reference/rwa-overview).
 *
 * Usage: pnpm --filter @cowprotocol/rwa-frontend update-registry
 * Env: COINGECKO_API_KEY (required), COINGECKO_API_PLAN (`pro` for pro-api.coingecko.com, Demo API otherwise).
 *
 * Hand-edited fields of assets and tokens that are already in the file are kept:
 * asset `title`, `priority`, `allowedTradingTime` and token `symbol`, `name`, `issuer`.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getAddress, isAddress } from 'viem'

import { areAddressesEqual, isSupportedChain } from '@cowprotocol/cow-sdk'

const REGISTRY_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/RWAs.json')

const ASSET_TYPES = { stock: 'stock', etf: 'index' }
const ISSUER_NAMES = { 'ondo-tokenized-assets': 'Ondo' }
const DEFAULT_PRIORITY = 0
const DEFAULT_TRADING_TIME = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }

const CONCURRENCY = 8
const MAX_RETRIES = 5
const PAGE_SIZE = 250
const IDS_BATCH_SIZE = 100

const apiKey = process.env.COINGECKO_API_KEY
const isPro = process.env.COINGECKO_API_PLAN === 'pro'

if (!apiKey) {
  console.error('COINGECKO_API_KEY is required: the keyless API is too rate limited for the RWA endpoints')
  process.exit(1)
}

const BASE_URL = isPro ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3'
const HEADERS = { accept: 'application/json', [isPro ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key']: apiKey }

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY_PATH, 'utf8'))
  const platformChainIds = await fetchPlatformChainIds()
  const rwas = (await coingecko('/rwas/list')).filter((rwa) => {
    if (ASSET_TYPES[rwa.asset_type]) return true

    console.warn(`Skipping ${rwa.id}: asset type "${rwa.asset_type}" is not supported by the registry`)
    return false
  })

  console.log(`Fetching ${rwas.length} RWAs`)

  const [details, rwaMarkets, decimalsByPlatform] = await Promise.all([
    mapConcurrent(rwas, (rwa) => coingecko(`/rwas/${encodeURIComponent(rwa.id)}?tokens=true`)),
    fetchRwaMarkets(),
    fetchTokenListDecimals(Object.keys(platformChainIds)),
  ])

  const coinIds = [...new Set(details.flatMap((rwa) => (rwa.tokens ?? []).map((token) => token.id)))]
  const tokenMarketCaps = await fetchCoinMarketCaps(coinIds)
  const existingAssets = new Map(registry.assets.map((asset) => [asset.ticker, asset]))

  const assets = []

  for (const rwa of [...details].sort(byDesc((rwa) => rwaMarkets.get(rwa.id)?.marketCap ?? 0))) {
    const ticker = rwa.symbol.toUpperCase()

    if (!/^[A-Z0-9.]+$/.test(ticker)) {
      console.warn(`Skipping ${rwa.id}: ticker "${ticker}" is not supported by the registry`)
      continue
    }

    if (assets.some((asset) => asset.ticker === ticker)) {
      console.warn(`Skipping ${rwa.id}: duplicate ticker "${ticker}"`)
      continue
    }

    const existing = existingAssets.get(ticker)
    const tokens = await buildTokens(rwa, existing, { platformChainIds, decimalsByPlatform, tokenMarketCaps })

    if (!tokens.length) continue

    assets.push({
      ticker,
      coingeckoId: rwa.id,
      title: existing?.title ?? rwa.name,
      logoUrl: rwaMarkets.get(rwa.id)?.logoUrl,
      type: ASSET_TYPES[rwa.asset_type],
      priority: existing?.priority ?? DEFAULT_PRIORITY,
      allowedTradingTime: existing ? existing.allowedTradingTime : DEFAULT_TRADING_TIME,
      tokens,
    })
  }

  const changed = JSON.stringify(assets) !== JSON.stringify(registry.assets)
  const next = changed
    ? { version: bumpPatch(registry.version), lastModificationTime: new Date().toISOString(), assets }
    : registry

  await writeFile(REGISTRY_PATH, `${JSON.stringify(next, null, 2)}\n`)

  const tokensCount = assets.reduce((sum, asset) => sum + asset.tokens.length, 0)
  console.log(
    changed
      ? `Wrote ${assets.length} assets, ${tokensCount} tokens, version ${next.version}`
      : `No changes (${assets.length} assets, ${tokensCount} tokens)`,
  )
}

/** Tokens on CoW-supported chains, the largest token market cap first, so the first one is the price reference */
async function buildTokens(rwa, existing, { platformChainIds, decimalsByPlatform, tokenMarketCaps }) {
  const coins = [...(rwa.tokens ?? [])].sort(byDesc((coin) => tokenMarketCaps.get(coin.id) ?? 0))
  const tokens = []

  for (const coin of coins) {
    for (const [platform, address] of Object.entries(coin.platforms ?? {})) {
      const chainId = platformChainIds[platform]

      if (!chainId || !address || !isAddress(address, { strict: false })) continue

      const decimals =
        decimalsByPlatform[platform]?.get(getAddress(address)) ?? (await fetchCoinDecimals(coin.id, platform))

      if (!Number.isInteger(decimals) || decimals < 0) {
        console.warn(`Skipping ${coin.id} on ${platform}: unknown decimals`)
        continue
      }

      const previous = existing?.tokens.find(
        (token) => token.chainId === chainId && areAddressesEqual(token.address, address),
      )

      tokens.push({
        chainId,
        address: getAddress(address),
        symbol: previous?.symbol ?? coin.symbol.toUpperCase(),
        name: previous?.name ?? coin.name,
        decimals,
        issuer: previous?.issuer ?? ISSUER_NAMES[coin.issuer_details?.id] ?? coin.issuer_details?.name ?? 'Unknown',
        coingeckoId: coin.id,
      })
    }
  }

  return tokens
}

/** CoinGecko asset platform id -> chain id, for the chains CoW supports */
async function fetchPlatformChainIds() {
  const platforms = await coingecko('/asset_platforms')

  return Object.fromEntries(
    platforms
      .filter((platform) => platform.chain_identifier && isSupportedChain(platform.chain_identifier))
      .map((platform) => [platform.id, platform.chain_identifier]),
  )
}

/** RWA id -> tokenized market cap (USD) and logo */
async function fetchRwaMarkets() {
  const markets = new Map()

  for (let page = 1; ; page++) {
    const items = await coingecko(`/rwas/markets?per_page=${PAGE_SIZE}&page=${page}`)

    items.forEach((item) =>
      markets.set(item.id, {
        marketCap: item.tokenized_market_data?.market_cap ?? 0,
        logoUrl: toLogoUrl(item.image),
      }),
    )

    if (items.length < PAGE_SIZE) return markets
  }
}

/** CoinGecko answers `missing_large.png`, a relative path, for RWAs without an image */
function toLogoUrl(image) {
  return typeof image === 'string' && URL.canParse(image) && new URL(image).protocol === 'https:' ? image : undefined
}

/** Coin id -> market cap, USD */
async function fetchCoinMarketCaps(ids) {
  const batches = chunk(ids, IDS_BATCH_SIZE)
  const results = await mapConcurrent(batches, (batch) =>
    coingecko(`/coins/markets?vs_currency=usd&per_page=${PAGE_SIZE}&ids=${batch.join(',')}`),
  )

  return new Map(results.flat().map((coin) => [coin.id, coin.market_cap ?? 0]))
}

/** Platform id -> checksummed address -> decimals. Token lists are Pro-only, `/coins/{id}` covers the rest */
async function fetchTokenListDecimals(platforms) {
  if (!isPro) return {}

  const lists = await mapConcurrent(platforms, (platform) =>
    coingecko(`/token_lists/${platform}/all.json`).catch((err) => {
      console.warn(`No token list for ${platform}: ${err instanceof Error ? err.message : String(err)}`)
      return { tokens: [] }
    }),
  )

  return Object.fromEntries(
    platforms.map((platform, index) => [
      platform,
      new Map(lists[index].tokens.map((token) => [getAddress(token.address), token.decimals])),
    ]),
  )
}

const coinDetails = new Map()

async function fetchCoinDecimals(coinId, platform) {
  if (!coinDetails.has(coinId)) {
    coinDetails.set(
      coinId,
      coingecko(
        `/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
      ),
    )
  }

  const coin = await coinDetails.get(coinId)

  return coin.detail_platforms?.[platform]?.decimal_place
}

async function coingecko(path) {
  for (let attempt = 0; ; attempt++) {
    let response

    try {
      response = await fetch(`${BASE_URL}${path}`, { headers: HEADERS })
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err

      await sleep(2 ** attempt * 1000)
      continue
    }

    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get('retry-after'))
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000)
      continue
    }

    if (!response.ok) throw new Error(`CoinGecko ${path.split('?')[0]} responded with ${response.status}`)

    return response.json()
  }
}

async function mapConcurrent(items, fn) {
  const results = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker))

  return results
}

function chunk(items, size) {
  const chunks = []

  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))

  return chunks
}

function byDesc(getValue) {
  return (a, b) => getValue(b) - getValue(a)
}

function bumpPatch(version) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)

  return `${major}.${minor}.${patch + 1}`
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
