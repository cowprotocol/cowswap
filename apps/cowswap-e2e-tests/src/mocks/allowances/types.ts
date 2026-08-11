import { getAddressKey } from '@cowprotocol/cow-sdk'

/**
 * Flat allowance lookup keyed by `${owner}|${chainId}|${token}`, addresses lowercased.
 *
 * Flat rather than nested so that overrides are a second map of the same shape:
 * "override wins, else fixture, else 0" is then a two-line lookup, and merging a
 * single token into an owner/chain needs no nested-object cloning.
 */
export type AllowanceLookup = Map<string, bigint>

/** One allowance read observed on the wire, exposed via `mocks.allowances.reads()`. */
export interface AllowanceRead {
  chainId: number
  owner: string
  spender: string
  token: string
  value: bigint
}

/** A value as it may appear in the JSON fixture or a `set()` call. Always raw atoms. */
export type AllowanceValue = string | number | bigint

export function allowanceKey(owner: string, chainId: number, token: string): string {
  return `${getAddressKey(owner)}|${chainId}|${getAddressKey(token)}`
}

/** Prefix of every key belonging to `owner`, for owner-level scans. */
export function ownerKeyPrefix(owner: string): string {
  return `${getAddressKey(owner)}|`
}
