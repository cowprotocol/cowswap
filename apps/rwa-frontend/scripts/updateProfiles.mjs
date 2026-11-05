#!/usr/bin/env node
/**
 * Fills `profile.description` and `profile.sector` of data/RWAs.json assets: Wikipedia summaries (matched through
 * Wikidata NYSE/Nasdaq/HKEX/LSE listings) reworded by Claude, or Claude alone for assets without an article.
 *
 * Usage: pnpm --filter @cowprotocol/rwa-frontend update-profiles [--source wikipedia|ai] [--force] [--ticker NVDA ...] [--offset 0] [--limit 10] [--dry-run]
 * Env: ANTHROPIC_API_KEY (required).
 *
 * Only assets without a profile are filled unless `--force`. `website` is hand-edited: it is never written, and kept
 * by `--force`. Commodities are skipped. `--offset` and `--limit` pick a slice of the candidates in registry order;
 * without `--force`, filled assets stop being candidates, so the next chunk is `--limit` alone.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { buildProfilePrompt, parseProfileResponse, requestProfile } from './profiles/claude.mjs'
import { fetchWikidataMatches } from './profiles/wikidata.mjs'
import { fetchSourceTexts } from './profiles/wikipedia.mjs'
import { readRegistry, writeRegistry } from './registryFile.mjs'

const REGISTRY_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/RWAs.json')
const SOURCES = ['wikipedia', 'ai']
const CONCURRENCY = 4
const SAVE_INTERVAL_MS = 1000
const USAGE =
  'Usage: update-profiles [--source wikipedia|ai] [--force] [--ticker NVDA ...] [--offset 0] [--limit 10] [--dry-run]\nEnv: ANTHROPIC_API_KEY'

async function main() {
  const options = readOptions()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) exit('ANTHROPIC_API_KEY is required')

  const { registry, maps } = await readRegistry(REGISTRY_PATH)
  const candidates = registry.assets
    .filter(
      (asset) =>
        asset.type !== 'commodity' &&
        (!options.tickers.length || options.tickers.includes(asset.ticker)) &&
        (options.force || !asset.profile),
    )
    .slice(options.offset, options.limit === undefined ? undefined : options.offset + options.limit)
  console.log(`${candidates.length} candidates`)

  const sources = await loadSources(candidates)
  const selected = candidates.filter((asset) => {
    if (options.source === 'wikipedia') return sources.has(asset.ticker)
    if (options.source === 'ai') return !sources.has(asset.ticker)
    return true
  })
  console.log(
    `${selected.length} selected (${selected.filter((asset) => sources.has(asset.ticker)).length} with Wikipedia text)`,
  )

  const report = { filled: [], skipped: [], rejected: [], failed: [] }
  const writer = createRegistryWriter(registry, maps, options.dryRun)
  let done = 0
  const logResult = (ticker, result) => console.log(`[${++done}/${selected.length}] ${ticker}: ${result}`)

  await forEachConcurrently(selected, async (asset) => {
    const source = sources.get(asset.ticker)
    const prompt = buildProfilePrompt({
      ticker: asset.ticker,
      title: asset.title,
      type: asset.type,
      sourceText: source?.sourceText ?? null,
      industry: source?.industry ?? null,
    })

    try {
      const text = await requestProfile(prompt, apiKey)
      const profile = parseProfileResponse(text, asset.title)

      if (!profile) {
        const result = /"skip"\s*:\s*true/.test(text) ? 'skipped' : 'rejected'
        report[result].push(asset.ticker)
        logResult(asset.ticker, result)
        return
      }

      report.filled.push(asset.ticker)
      logResult(asset.ticker, options.dryRun ? `${profile.sector} | ${profile.description}` : 'filled')

      await writer.setProfile(asset.ticker, {
        ...profile,
        ...(asset.profile?.website ? { website: asset.profile.website } : {}),
      })
    } catch (err) {
      report.failed.push(asset.ticker)
      logResult(asset.ticker, `failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  })

  await writer.flush()
  printReport(report, options.source === 'wikipedia' ? candidates.filter((asset) => !sources.has(asset.ticker)) : [])
}

function readOptions() {
  let values
  try {
    ;({ values } = parseArgs({
      options: {
        source: { type: 'string' },
        force: { type: 'boolean', default: false },
        ticker: { type: 'string', multiple: true, default: [] },
        offset: { type: 'string' },
        limit: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
      },
    }))
  } catch (err) {
    exit(`${err instanceof Error ? err.message : String(err)}\n${USAGE}`)
  }

  if (values.source !== undefined && !SOURCES.includes(values.source))
    exit(`Invalid --source "${values.source}"\n${USAGE}`)

  return {
    source: values.source,
    force: values.force,
    tickers: values.ticker,
    offset: readInteger('offset', values.offset, 0) ?? 0,
    limit: readInteger('limit', values.limit, 1),
    dryRun: values['dry-run'],
  }
}

function readInteger(name, value, min) {
  if (value === undefined) return undefined

  const number = Number(value)
  if (!Number.isInteger(number) || number < min) exit(`Invalid --${name} "${value}"\n${USAGE}`)

  return number
}

/** Ticker to Wikipedia source text and Wikidata industry, for candidates with a usable article */
async function loadSources(candidates) {
  const matches = await fetchWikidataMatches(
    candidates.map((asset) => asset.ticker),
    (done, total) => console.log(`Wikidata: ${done}/${total} tickers`),
  )
  const texts = await fetchSourceTexts(
    [...matches.values()].flatMap((match) => match.articleTitle ?? []),
    (done, total) => console.log(`Wikipedia: ${done}/${total} articles`),
  )
  const sources = new Map()

  for (const [ticker, match] of matches) {
    const sourceText = match.articleTitle ? texts.get(match.articleTitle) : undefined
    if (sourceText) sources.set(ticker, { sourceText, industry: match.industry })
  }

  return sources
}

/**
 * Saves profiles as they come, at most once per `SAVE_INTERVAL_MS`. The version is bumped once per run.
 */
function createRegistryWriter(registry, maps, dryRun) {
  const next = { ...registry, assets: [...registry.assets] }
  let changed = false
  let lastSave = 0
  let saving = Promise.resolve()

  function save() {
    if (dryRun || !changed) return saving

    lastSave = Date.now()
    saving = saving.then(() => writeRegistry(REGISTRY_PATH, next, maps))

    return saving
  }

  return {
    async setProfile(ticker, profile) {
      const index = next.assets.findIndex((asset) => asset.ticker === ticker)
      const previous = next.assets[index]
      if (JSON.stringify(previous.profile) === JSON.stringify(profile)) return

      next.assets[index] = withProfile(previous, profile)
      if (!changed) {
        changed = true
        next.version = bumpPatch(registry.version)
        next.lastModificationTime = new Date().toISOString()
      }
      if (Date.now() - lastSave >= SAVE_INTERVAL_MS) await save()
    },
    flush: save,
  }
}

/** Keeps the key order of `update-registry`, where `profile` comes right before `tokens` */
function withProfile(asset, profile) {
  const { profile: _previous, tokens, ...rest } = asset

  return { ...rest, profile, tokens }
}

async function forEachConcurrently(items, callback) {
  let nextIndex = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (nextIndex < items.length) await callback(items[nextIndex++])
  })

  await Promise.all(workers)
}

function printReport(report, withoutSource) {
  for (const [label, tickers] of Object.entries(report)) {
    console.log(`${label}: ${tickers.length}${tickers.length ? ` (${tickers.sort().join(', ')})` : ''}`)
  }
  if (withoutSource.length) console.log(`without Wikipedia text: ${withoutSource.length}`)
}

function bumpPatch(version) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)

  return `${major}.${minor}.${patch + 1}`
}

function exit(message) {
  console.error(message)
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
