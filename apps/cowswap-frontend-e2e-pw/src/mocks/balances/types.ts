/**
 * Flat balance lookup keyed by `${owner}|${chainId}|${token}`, addresses lowercased.
 *
 * Mirrors `AllowanceLookup` in `../allowances/types.ts`: flat rather than nested so
 * that overrides are a second map of the same shape, and merging a single token
 * into an owner/chain needs no nested-object cloning.
 */
export type BalanceLookup = Map<string, bigint>

/** One `POST /{chainId}/sessions/{owner}` observed on the wire, exposed via `mocks.balances.sessions()`. */
export interface BalancesSessionRequest {
  chainId: number
  owner: string
  tokensListsUrls: string[]
  customTokens: string[]
}

/** A value as it may appear in the JSON fixture or a `set()` call. Always raw atoms. */
export type BalanceValue = string | number | bigint

export function balanceKey(owner: string, chainId: number, token: string): string {
  return `${owner.toLowerCase()}|${chainId}|${token.toLowerCase()}`
}

/** Prefix of every key belonging to `owner` on `chainId`, for the SSE snapshot scan. */
export function balanceOwnerChainPrefix(owner: string, chainId: number): string {
  return `${owner.toLowerCase()}|${chainId}|`
}
