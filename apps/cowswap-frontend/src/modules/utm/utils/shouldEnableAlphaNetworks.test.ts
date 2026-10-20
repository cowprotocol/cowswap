import { ENABLE_ALPHA_NETWORKS_UTM_CONTENT, shouldEnableAlphaNetworks } from './shouldEnableAlphaNetworks'

describe('shouldEnableAlphaNetworks', () => {
  it('returns true when utm_content comes from the Solana landing page hero', () => {
    expect(shouldEnableAlphaNetworks({ utmSource: 'cow.fi', utmContent: ENABLE_ALPHA_NETWORKS_UTM_CONTENT })).toBe(true)
  })

  it('returns false for other utm_content values', () => {
    expect(shouldEnableAlphaNetworks({ utmContent: 'solana-page-bottom-trade-on-solana' })).toBe(false)
  })

  it('returns false when utm_content is missing', () => {
    expect(shouldEnableAlphaNetworks({ utmSource: 'cow.fi' })).toBe(false)
  })
})
