export const SOLANA_VERSIONS = ['alpha', 'beta', 'ga'] as const

export type SolanaVersion = (typeof SOLANA_VERSIONS)[number]

/**
 * Used when LaunchDarkly has no value yet, is unreachable, or serves an unknown variation.
 * `alpha` is the most restrictive version: Solana stays behind the alpha networks opt-in.
 */
export const DEFAULT_SOLANA_VERSION: SolanaVersion = 'alpha'

/**
 * Whether Solana has left alpha: it is listed for everyone, the alpha networks opt-in no longer
 * gates it, and the menu option to toggle that opt-in is hidden.
 */
export function isSolanaBetaOrHigher(version: SolanaVersion): boolean {
  return version !== 'alpha'
}

export function parseSolanaVersion(value: unknown): SolanaVersion {
  return SOLANA_VERSIONS.find((version) => version === value) ?? DEFAULT_SOLANA_VERSION
}
