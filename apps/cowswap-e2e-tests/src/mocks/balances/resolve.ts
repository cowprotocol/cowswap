import { balanceOwnerChainPrefix, type BalanceLookup } from './types'

export function hasAnyEntry(fixture: BalanceLookup, overrides: BalanceLookup): boolean {
  return fixture.size > 0 || overrides.size > 0
}

/** Whether any entry at all exists for `owner` on `chainId`, for any token. */
export function isOwnerConfigured(
  fixture: BalanceLookup,
  overrides: BalanceLookup,
  owner: string,
  chainId: number,
): boolean {
  const prefix = balanceOwnerChainPrefix(owner, chainId)
  return hasKeyWithPrefix(overrides, prefix) || hasKeyWithPrefix(fixture, prefix)
}

/**
 * The full `{token: balance}` snapshot for `owner` on `chainId` — what the SSE
 * stream's first event after connect returns.
 *
 * Per-token, override wins over fixture. A token present in the fixture but
 * overridden to a different value only appears once, at the override's value.
 * Values come back as decimal strings, matching `BalancesMap` on the wire.
 */
export function resolveBalancesSnapshot(
  fixture: BalanceLookup,
  overrides: BalanceLookup,
  owner: string,
  chainId: number,
): Record<string, string> {
  const prefix = balanceOwnerChainPrefix(owner, chainId)
  const snapshot: Record<string, string> = {}

  for (const [key, value] of fixture) {
    if (key.startsWith(prefix)) snapshot[tokenOf(key)] = value.toString()
  }
  for (const [key, value] of overrides) {
    if (key.startsWith(prefix)) snapshot[tokenOf(key)] = value.toString()
  }

  return snapshot
}

function hasKeyWithPrefix(lookup: BalanceLookup, prefix: string): boolean {
  for (const key of lookup.keys()) {
    if (key.startsWith(prefix)) return true
  }
  return false
}

function tokenOf(key: string): string {
  const token = key.split('|')[2]
  if (token === undefined) throw new Error(`malformed balance key: "${key}"`)
  return token
}
