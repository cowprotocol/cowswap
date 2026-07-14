export type FeatureFlags = Record<string, FeatureFlagValue>

export type FeatureFlagValue = boolean | number | undefined

export let IS_SOLANA_ENABLED = typeof localStorage !== 'undefined' && !!localStorage.getItem('IS_SOLANA_ENABLED')

if (typeof location !== 'undefined') {
  const value = new URLSearchParams(location.hash.split('?')[1]).get('IS_SOLANA_ENABLED')

  IS_SOLANA_ENABLED = value === 'true'
}
