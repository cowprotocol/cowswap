export type FeatureFlags = Record<string, FeatureFlagValue>

export type FeatureFlagValue = boolean | number | undefined

if (typeof location !== 'undefined') {
  const value = new URLSearchParams(location.hash.split('?')[1]).get('IS_SOLANA_ENABLED')

  if (value === 'true') {
    localStorage.setItem('IS_SOLANA_ENABLED', '1')
  } else {
    localStorage.removeItem('IS_SOLANA_ENABLED')
  }
}

export const IS_SOLANA_ENABLED = typeof localStorage !== 'undefined' && !!localStorage.getItem('IS_SOLANA_ENABLED')
