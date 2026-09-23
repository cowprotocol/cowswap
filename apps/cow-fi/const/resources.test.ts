import { getCampaignLabel, getResourcePath, resolveResourceRoute } from './resources'

describe('getCampaignLabel', () => {
  it('returns the configured label for a known campaign', () => {
    expect(getCampaignLabel('tokens')).toBe('Tokens')
  })

  it('title-cases unknown hyphenated campaign slugs', () => {
    expect(getCampaignLabel('intent-hooks')).toBe('Intent Hooks')
    expect(getCampaignLabel('mev-blocker-guide')).toBe('Mev Blocker Guide')
  })

  it('title-cases a single unknown slug segment', () => {
    expect(getCampaignLabel('solvers')).toBe('Solvers')
  })

  it('does not read inherited object properties such as constructor', () => {
    const label = getCampaignLabel('constructor')

    expect(typeof label).toBe('string')
    expect(label).toBe('Constructor')
    expect(label.toLowerCase()).toBe('constructor')
  })

  it('does not read other inherited object properties', () => {
    expect(getCampaignLabel('toString')).toBe('ToString')
    expect(getCampaignLabel('hasOwnProperty')).toBe('HasOwnProperty')
    expect(getCampaignLabel('__proto__')).toBe('__proto__')
  })
})

describe('getResourcePath', () => {
  it('builds a canonical resources path', () => {
    expect(getResourcePath('tokens', 'cow-token')).toBe('/resources/tokens/cow-token')
  })
})

describe('resolveResourceRoute', () => {
  it('renders when the URL campaign matches the CMS campaign', () => {
    expect(resolveResourceRoute('tokens', 'tokens', 'cow-token')).toEqual({ action: 'render' })
  })

  it('redirects to the canonical path when the campaign does not match', () => {
    expect(resolveResourceRoute('learn', 'tokens', 'cow-token')).toEqual({
      action: 'redirect',
      href: '/resources/tokens/cow-token',
    })
  })

  it('returns not-found instead of redirecting to /resources/undefined/...', () => {
    expect(resolveResourceRoute('tokens', undefined, 'cow-token')).toEqual({ action: 'not-found' })
    expect(resolveResourceRoute('tokens', null, 'cow-token')).toEqual({ action: 'not-found' })
    expect(resolveResourceRoute('tokens', '', 'cow-token')).toEqual({ action: 'not-found' })
  })

  it('keeps constructor as a real campaign slug during redirects', () => {
    expect(resolveResourceRoute('tokens', 'constructor', 'example')).toEqual({
      action: 'redirect',
      href: '/resources/constructor/example',
    })
  })
})
