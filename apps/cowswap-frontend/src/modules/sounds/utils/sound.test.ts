import { CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import type { FeatureFlags } from '@cowprotocol/common-const'

function buildFlags(overrides: FeatureFlags = {}): FeatureFlags {
  return {
    isHalloweenEnabled: false,
    isChristmasEnabled: false,
    ...overrides,
  }
}

describe('resolveCustomThemeForContext', () => {
  it('returns undefined when no seasonal flags are enabled', () => {
    expect(resolveCustomThemeForContext(undefined, { darkModeEnabled: true })).toBeUndefined()
    expect(resolveCustomThemeForContext(buildFlags(), { darkModeEnabled: false })).toBeUndefined()
  })

  it('returns HALLOWEEN when Halloween is enabled and dark mode is active', () => {
    expect(resolveCustomThemeForContext(buildFlags({ isHalloweenEnabled: true }), { darkModeEnabled: true })).toBe(
      CustomTheme.HALLOWEEN
    )
  })

  it('does not activate HALLOWEEN when dark mode is disabled', () => {
    expect(resolveCustomThemeForContext(buildFlags({ isHalloweenEnabled: true }), { darkModeEnabled: false })).toBeUndefined()
  })

  it('returns CHRISTMAS when only the Christmas flag is enabled', () => {
    expect(resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true }), { darkModeEnabled: true })).toBe(
      CustomTheme.CHRISTMAS
    )
    expect(resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true }), { darkModeEnabled: false })).toBe(
      CustomTheme.CHRISTMAS
    )
  })

  it('does not activate any seasonal theme when Halloween is enabled but dark mode is disabled', () => {
    expect(
      resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), {
        darkModeEnabled: false,
      })
    ).toBeUndefined()
  })

  it('prefers HALLOWEEN when both flags are enabled and dark mode is active', () => {
    expect(
      resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), {
        darkModeEnabled: true,
      })
    ).toBe(CustomTheme.HALLOWEEN)
  })

  it('returns undefined when feature flags object is missing and dark mode is disabled', () => {
    expect(resolveCustomThemeForContext(undefined, { darkModeEnabled: false })).toBeUndefined()
  })
})
