import { readFileSync } from 'node:fs'
import path from 'node:path'

import { allowanceKey, type AllowanceLookup, type AllowanceValue } from './types'

const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'allowances.json')
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const DECIMAL_RE = /^\d+$/

export function loadAllowancesFixture(): AllowanceLookup {
  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(FIXTURE_FILE, 'utf8')) as unknown
  } catch (error) {
    throw new Error(`Missing or invalid allowances fixture at ${FIXTURE_FILE}: ${String(error)}`)
  }
  return parseAllowancesFixture(raw, 'allowances.json')
}

/** Flatten `owner -> chainId -> token -> raw atoms` into a keyed lookup, validating as it goes. */
export function parseAllowancesFixture(raw: unknown, source: string): AllowanceLookup {
  const lookup: AllowanceLookup = new Map()

  for (const [owner, byChain] of entriesOf(raw, `${source}: fixture`, 'fixture')) {
    if (!ADDRESS_RE.test(owner)) {
      throw new Error(`${source}: "${owner}" is not a valid owner address`)
    }

    for (const [chainKey, byToken] of entriesOf(byChain, `${source}["${owner}"]`, 'owner entry')) {
      if (!DECIMAL_RE.test(chainKey)) {
        throw new Error(`${source}["${owner}"]: "${chainKey}" is not a valid chain id`)
      }
      const chainId = Number(chainKey)

      for (const [token, value] of entriesOf(byToken, `${source}["${owner}"]["${chainKey}"]`, 'chain entry')) {
        if (!ADDRESS_RE.test(token)) {
          throw new Error(`${source}["${owner}"]["${chainKey}"]: "${token}" is not a valid token address`)
        }
        const where = `${source}["${owner}"]["${chainKey}"]["${token}"]`
        lookup.set(allowanceKey(owner, chainId, token), parseAllowanceValue(value as AllowanceValue, where))
      }
    }
  }

  return lookup
}

/**
 * Parse a raw-atom allowance value.
 *
 * A JSON number is only accepted when it is a safe integer: `JSON.parse` silently
 * rounds anything larger, so a raw-atom value like 1000000000000000000 must be
 * written as a string to survive the round trip.
 */
export function parseAllowanceValue(raw: unknown, where: string): bigint {
  if (typeof raw === 'bigint') {
    if (raw < 0n) throw new Error(`${where}: allowance is negative`)
    return raw
  }

  if (typeof raw === 'number') {
    if (!Number.isSafeInteger(raw)) {
      throw new Error(
        `${where}: ${raw} is not a safe integer — write large raw-atom values as strings, e.g. "1000000000000000000"`,
      )
    }
    if (raw < 0) throw new Error(`${where}: allowance is negative`)
    return BigInt(raw)
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('-')) throw new Error(`${where}: allowance is negative`)
    if (!DECIMAL_RE.test(trimmed)) {
      throw new Error(`${where}: "${raw}" is not a decimal integer — values are raw atoms, with no decimal point`)
    }
    return BigInt(trimmed)
  }

  throw new Error(`${where}: expected a decimal string or a safe integer, got ${typeof raw}`)
}

function entriesOf(value: unknown, where: string, what: string): Array<[string, unknown]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${where}: expected ${what} to be a JSON object`)
  }
  return Object.entries(value as Record<string, unknown>)
}
