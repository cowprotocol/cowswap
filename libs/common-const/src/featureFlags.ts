export type FeatureFlags = Record<string, FeatureFlagValue>

export type FeatureFlagValue = boolean | number | undefined

if (typeof location !== 'undefined') {
  const params = new URLSearchParams(location.hash.split('?')[1])

  const solanaFlag = params.get('IS_SOLANA_ENABLED')
  if (solanaFlag === 'true') {
    localStorage.setItem('IS_SOLANA_ENABLED', '1')
  } else if (solanaFlag === 'false') {
    localStorage.removeItem('IS_SOLANA_ENABLED')
  }

  const stellarFlag = params.get('IS_STELLAR_ENABLED')
  if (stellarFlag === 'true') {
    localStorage.setItem('IS_STELLAR_ENABLED', '1')
  } else if (stellarFlag === 'false') {
    localStorage.removeItem('IS_STELLAR_ENABLED')
  }
}

export const IS_SOLANA_ENABLED = typeof localStorage !== 'undefined' && !!localStorage.getItem('IS_SOLANA_ENABLED')

export const IS_STELLAR_ENABLED = typeof localStorage !== 'undefined' && !!localStorage.getItem('IS_STELLAR_ENABLED')
