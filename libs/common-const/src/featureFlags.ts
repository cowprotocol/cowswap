export type FeatureFlagValue = boolean | number | undefined

export type FeatureFlags = Record<string, FeatureFlagValue>

export const IS_SOLANA_ENABLED = typeof localStorage !== 'undefined' && !!localStorage.getItem('IS_SOLANA_ENABLED')
