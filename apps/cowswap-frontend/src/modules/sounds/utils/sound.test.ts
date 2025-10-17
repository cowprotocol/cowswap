import { CustomTheme } from '@cowprotocol/common-const'

import { resolveSeasonalTheme } from './sound'

type FeatureFlags = Record<string, boolean | number | undefined>

function buildFlags(overrides: FeatureFlags = {}): FeatureFlags {
  return {
    isHalloweenEnabled: false,
    isChristmasEnabled: false,
    ...overrides,
  }
}

describe('resolveSeasonalTheme', () => {
  it('returns undefined when no seasonal flags are enabled', () => {
    expect(resolveSeasonalTheme(undefined, true)).toBeUndefined()
    expect(resolveSeasonalTheme(buildFlags(), false)).toBeUndefined()
  })

  it('returns HALLOWEEN when Halloween is enabled and dark mode is active', () => {
    expect(resolveSeasonalTheme(buildFlags({ isHalloweenEnabled: true }), true)).toBe(CustomTheme.HALLOWEEN)
  })

  it('does not activate HALLOWEEN when dark mode is disabled', () => {
    expect(resolveSeasonalTheme(buildFlags({ isHalloweenEnabled: true }), false)).toBeUndefined()
  })

  it('returns CHRISTMAS when only the Christmas flag is enabled', () => {
    expect(resolveSeasonalTheme(buildFlags({ isChristmasEnabled: true }), true)).toBe(CustomTheme.CHRISTMAS)
    expect(resolveSeasonalTheme(buildFlags({ isChristmasEnabled: true }), false)).toBe(CustomTheme.CHRISTMAS)
  })

  it('falls back to CHRISTMAS when both flags are enabled but dark mode is disabled', () => {
    expect(
      resolveSeasonalTheme(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), false)
    ).toBe(CustomTheme.CHRISTMAS)
  })

  it('prefers HALLOWEEN when both flags are enabled and dark mode is active', () => {
    expect(
      resolveSeasonalTheme(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), true)
    ).toBe(CustomTheme.HALLOWEEN)
  })
})
