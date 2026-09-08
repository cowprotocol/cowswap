import { allowanceKey, ownerKeyPrefix, type AllowanceLookup } from './types'

export function hasAnyEntry(fixture: AllowanceLookup, overrides: AllowanceLookup): boolean {
  return fixture.size > 0 || overrides.size > 0
}

/** Whether any entry at all exists for `owner`, on any chain, for any token. */
export function isOwnerConfigured(fixture: AllowanceLookup, overrides: AllowanceLookup, owner: string): boolean {
  const prefix = ownerKeyPrefix(owner)
  return hasKeyWithPrefix(overrides, prefix) || hasKeyWithPrefix(fixture, prefix)
}

/**
 * Override wins, else the fixture, else 0.
 *
 * Defaulting to 0 rather than forwarding to the real node is what makes a spec
 * deterministic before it configures anything: a token nobody declared reads as
 * "needs approval" instead of as whatever the shared test account happens to hold.
 */
export function resolveAllowance(
  fixture: AllowanceLookup,
  overrides: AllowanceLookup,
  owner: string,
  chainId: number,
  token: string,
): bigint {
  const key = allowanceKey(owner, chainId, token)
  return overrides.get(key) ?? fixture.get(key) ?? 0n
}

function hasKeyWithPrefix(lookup: AllowanceLookup, prefix: string): boolean {
  for (const key of lookup.keys()) {
    if (key.startsWith(prefix)) return true
  }
  return false
}
