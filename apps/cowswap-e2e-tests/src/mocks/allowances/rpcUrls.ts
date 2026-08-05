import { CHAIN_IDS } from '../../support/constants'

/**
 * Compare RPC URLs by origin + path + query, ignoring a trailing slash.
 *
 * The path and query matter: providers put the API key in one or the other
 * (`.../v3/<key>`, `?apikey=<key>`), so comparing origins alone would match the
 * wrong endpoint.
 */
export function normalizeRpcUrl(url: string): string {
  const parsed = new URL(url)
  return `${parsed.origin}${parsed.pathname}${parsed.search}`.replace(/\/$/, '')
}

/**
 * Normalized RPC URL -> chain id, for the chains the app has an override for.
 *
 * Mirrors how the app resolves its transports: `RPC_URLS[chainId]` in
 * `libs/common-const/src/networks.ts` prefers `REACT_APP_NETWORK_URL_<chainId>`.
 * A chain with no override falls back to a public/Infura default in the app, which
 * this mock deliberately does not intercept — see `unconfiguredChainIds`.
 */
export function resolveRpcChainIds(env: NodeJS.ProcessEnv = process.env): Map<string, number> {
  const map = new Map<string, number>()

  for (const chainId of Object.values(CHAIN_IDS)) {
    const raw = env[`REACT_APP_NETWORK_URL_${chainId}`]?.trim()
    if (!raw) continue

    try {
      map.set(normalizeRpcUrl(raw), chainId)
    } catch {
      // A malformed env value is the app's problem, not the mock's — skip it.
    }
  }

  return map
}

/** Chains from `CHAIN_IDS` with no RPC override, and so not intercepted. */
export function unconfiguredChainIds(env: NodeJS.ProcessEnv = process.env): number[] {
  const configured = new Set(resolveRpcChainIds(env).values())
  return Object.values(CHAIN_IDS).filter((chainId) => !configured.has(chainId))
}
