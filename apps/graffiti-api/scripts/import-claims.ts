/**
 * Load already-printed claim codes into a database that does not have them yet.
 *
 * `claims:gen` mints fresh random codes, so it cannot be used to put a batch that is already on
 * paper into a later environment. This reads the same code list `claims:pdf` consumed and inserts
 * those exact codes.
 *
 * Usage: pnpm claims:import -- --codes data/codes.txt --amount 1000
 */
import fs from 'node:fs'
import path from 'node:path'

import { isClaimCode } from '../src/claimCode.js'
import { loadConfig, PKG_ROOT } from '../src/config.js'
import { openStore } from '../src/store.js'

import type { ClaimState } from '../src/store.js'

interface ImportEntry {
  code: string
  amount: number
}

interface Options {
  codesFile: string
  amount: number | null
  dryRun: boolean
}

function entriesFromJson(raw: string): ImportEntry[] {
  const parsed: unknown = JSON.parse(raw)
  const list: unknown = Array.isArray(parsed) ? parsed : isRecord(parsed) ? parsed.codes : null

  if (!Array.isArray(list)) throw new Error('JSON codes file: expected an array or {codes:[...]}')

  return list.map((entry) => {
    if (typeof entry === 'string') return { code: entry, amount: Number.NaN }
    if (isRecord(entry) && typeof entry.code === 'string') {
      return { code: entry.code, amount: typeof entry.amount === 'number' ? entry.amount : Number.NaN }
    }
    throw new Error('JSON codes file: entries must be strings or {code, amount}')
  })
}

function entriesFromLines(raw: string): ImportEntry[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((code) => ({ code, amount: Number.NaN }))
}

function flag(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return null
  return process.argv[i + 1] ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function main(): void {
  const options = parseOptions()
  const entries = readEntries(options.codesFile, options.amount)
  const config = loadConfig()
  const store = openStore(config.dbPath, config.allowJsonStore)

  const existing = new Map<ClaimState, number>()
  let inserted = 0

  try {
    for (const entry of entries) {
      // A code that is absent cannot have been claimed, so checking before inserting cannot race
      // with a redemption. Skipping what is present is the whole point: `insertClaim` is an
      // INSERT OR REPLACE, and replaying a list over a live database would reset every spent code
      // to `unused` and let the treasury pay for it twice.
      const current = store.getClaim(entry.code)
      if (current) {
        existing.set(current.state, (existing.get(current.state) ?? 0) + 1)
        continue
      }
      if (!options.dryRun) store.insertClaim(entry.code, entry.amount)
      inserted++
    }
  } finally {
    store.close()
  }

  const verb = options.dryRun ? 'would insert' : 'inserted'
  console.error(`[claims:import] ${verb} ${inserted} of ${entries.length} code(s) into ${config.dbPath}`)

  for (const [state, count] of existing) {
    console.error(`[claims:import] left ${count} existing code(s) in state "${state}" untouched`)
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
  console.error(
    `[claims:import] fund the treasury for ${total.toLocaleString()} token(s) across ${entries.length} code(s)`,
  )
}

function parseOptions(): Options {
  const codes = flag('codes')
  if (process.argv.includes('--help') || codes === null) {
    console.log(`
Load already-printed claim codes into this environment's database.

  --codes <file>   code list from claims:gen --out, or the admin endpoint's JSON (required)
  --amount <n>     tokens per code; required unless the JSON carries amounts
  --dry-run        report what would change and write nothing

The database is GRAFFITI_DB (currently ${loadConfig().dbPath}).
Codes already present are left untouched, whatever state they are in.
`)
    process.exit(codes === null ? 1 : 0)
  }

  const rawAmount = flag('amount')
  return {
    codesFile: path.isAbsolute(codes) ? codes : path.resolve(PKG_ROOT, codes),
    amount: rawAmount === null ? null : Number(rawAmount),
    dryRun: process.argv.includes('--dry-run'),
  }
}

/** Accepts the admin endpoint's JSON and the one-code-per-line list, as `claims:pdf` does. */
function readEntries(file: string, fallbackAmount: number | null): ImportEntry[] {
  if (!fs.existsSync(file)) throw new Error(`codes file not found: ${file}`)

  const raw = fs.readFileSync(file, 'utf8').trim()
  const entries = raw.startsWith('{') || raw.startsWith('[') ? entriesFromJson(raw) : entriesFromLines(raw)

  const seen = new Set<string>()
  const unique = entries.filter((entry) => {
    if (seen.has(entry.code)) return false
    seen.add(entry.code)
    return true
  })

  if (unique.length !== entries.length) {
    console.error(`[claims:import] warning: dropped ${entries.length - unique.length} duplicate code(s)`)
  }

  const bad = unique.filter((entry) => !isClaimCode(entry.code))
  if (bad.length > 0) {
    const shown = bad.slice(0, 3).map((entry) => JSON.stringify(entry.code.slice(0, 60)))
    throw new Error(
      `${file}: ${bad.length} line(s) are not claim codes, e.g. ${shown.join(', ')}. ` +
        `A shell redirect captures the npm/pnpm banner — delete the stray lines.`,
    )
  }

  const missingAmount = unique.filter((entry) => !Number.isFinite(entry.amount) || entry.amount < 1)
  if (missingAmount.length > 0) {
    if (fallbackAmount === null) {
      throw new Error(`${file} carries no amounts: pass --amount <n> to say what each code is worth.`)
    }
    for (const entry of missingAmount) entry.amount = fallbackAmount
  }

  return unique
}

main()
