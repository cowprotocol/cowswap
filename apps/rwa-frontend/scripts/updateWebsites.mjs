#!/usr/bin/env node
/**
 * Fills `profile.website` of data/RWAs.json assets with the official website (`P856`) of the asset's Wikidata entity,
 * the value Wikipedia infoboxes show. The entity is matched by ticker like `update-profiles` does.
 *
 * Usage: pnpm --filter @cowprotocol/rwa-frontend update-websites [--force] [--ticker NVDA ...] [--dry-run]
 *
 * Only `https` links are written, reduced to origin and path by `sanitizeWebsite`. Only assets with a profile and
 * without a website are filled unless `--force`, which replaces existing websites too. The registry must pass
 * `validate-registry` before and after.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { fetchWebsites } from './profiles/websites.mjs'
import { fetchWikidataMatches } from './profiles/wikidata.mjs'
import { readRegistry, writeRegistry } from './registryFile.mjs'
import { assertValidRegistry } from './registryValidation.mjs'

const REGISTRY_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/RWAs.json')
const USAGE = 'Usage: update-websites [--force] [--ticker NVDA ...] [--dry-run]'
const WARNING = 'IMPORTANT! REVIEW THE CHANGES CAREFULLY! THEY COME FROM WIKIPEDIA'

async function main() {
  const options = readOptions()
  const { registry, maps } = await readRegistry(REGISTRY_PATH)
  assertValidRegistry(registry)

  const candidates = registry.assets.filter(
    (asset) =>
      asset.type !== 'commodity' &&
      asset.profile &&
      (!options.tickers.length || options.tickers.includes(asset.ticker)) &&
      (options.force || !asset.profile.website),
  )
  console.log(`${candidates.length} candidates`)

  const matches = await fetchWikidataMatches(
    candidates.map((asset) => asset.ticker),
    (done, total) => console.log(`Wikidata entities: ${done}/${total} tickers`),
  )
  const websites = await fetchWebsites(
    [...matches.values()].map((match) => match.item),
    (done, total) => console.log(`Wikidata websites: ${done}/${total} entities`),
  )

  const report = { added: [], changed: [], unchanged: [], unmatched: [], 'no website': [], ambiguous: [], rejected: [] }
  const updates = new Map()

  candidates.forEach((asset, index) => {
    const log = (label, detail) => {
      report[label].push(asset.ticker)
      console.log(`[${index + 1}/${candidates.length}] ${asset.ticker}: ${label}${detail ? ` ${detail}` : ''}`)
    }
    const match = matches.get(asset.ticker)
    const result = match && websites.get(match.item)
    const previous = asset.profile.website

    if (!match) return log('unmatched')
    if (!result) return log('no website', match.item)
    if (result.ambiguous) return log('ambiguous', `${match.item}: ${result.ambiguous.join(', ')}`)
    if (result.rejected) return log('rejected', `${match.item}: ${result.rejected.join('; ')}`)
    if (result.website === previous) return log('unchanged', result.website)

    updates.set(asset.ticker, result.website)
    log(previous ? 'changed' : 'added', previous ? `${previous} -> ${result.website}` : result.website)
  })

  if (updates.size && !options.dryRun) {
    const next = {
      ...registry,
      version: bumpPatch(registry.version),
      lastModificationTime: new Date().toISOString(),
      assets: registry.assets.map((asset) =>
        updates.has(asset.ticker)
          ? { ...asset, profile: { ...asset.profile, website: updates.get(asset.ticker) } }
          : asset,
      ),
    }
    assertValidRegistry(next)
    await writeRegistry(REGISTRY_PATH, next, maps)
    console.log(`Wrote ${updates.size} websites to ${REGISTRY_PATH}`)
  }

  for (const [label, tickers] of Object.entries(report)) {
    console.log(`${label}: ${tickers.length}${tickers.length ? ` (${tickers.sort().join(', ')})` : ''}`)
  }
  printWarning(options.dryRun)
}

function readOptions() {
  try {
    const { values } = parseArgs({
      options: {
        force: { type: 'boolean', default: false },
        ticker: { type: 'string', multiple: true, default: [] },
        'dry-run': { type: 'boolean', default: false },
      },
    })

    return { force: values.force, tickers: values.ticker, dryRun: values['dry-run'] }
  } catch (err) {
    console.error(`${err instanceof Error ? err.message : String(err)}\n${USAGE}`)
    process.exit(1)
  }
}

function printWarning(dryRun) {
  const lines = [
    WARNING,
    dryRun ? 'Dry run: nothing was written' : 'Check every website with git diff before committing',
  ]
  const width = Math.max(...lines.map((line) => line.length)) + 4
  const border = '#'.repeat(width + 2)
  const row = (text) => `#${text.padStart((width + text.length) / 2).padEnd(width)}#`

  console.log(`\n\x1b[1;31m${[border, row(''), ...lines.map(row), row(''), border].join('\n')}\x1b[0m\n`)
}

function bumpPatch(version) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)

  return `${major}.${minor}.${patch + 1}`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
