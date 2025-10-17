import type { FeatureFlags } from '@cowprotocol/common-const'
import type { CowSwapTheme } from '@cowprotocol/ui'

import { resolveCowSwapTheme } from './useCustomTheme'

function buildFlags(overrides: FeatureFlags = {}): FeatureFlags {
  return {
    isHalloweenEnabled: false,
    isChristmasEnabled: false,
    ...overrides,
  }
}

describe('resolveCowSwapTheme', () => {
  const cases: Array<{
    name: string
    darkMode: boolean
    featureFlags?: FeatureFlags
    expected: CowSwapTheme | undefined
  }> = [
    {
      name: 'returns undefined when no seasonal flags are enabled',
      darkMode: true,
      featureFlags: buildFlags(),
      expected: undefined,
    },
    {
      name: 'returns undefined when feature flags are missing',
      darkMode: true,
      featureFlags: undefined,
      expected: undefined,
    },
    {
      name: 'activates Halloween only when dark mode is enabled',
      darkMode: true,
      featureFlags: buildFlags({ isHalloweenEnabled: true }),
      expected: 'darkHalloween',
    },
    {
      name: 'skips Halloween when dark mode is disabled',
      darkMode: false,
      featureFlags: buildFlags({ isHalloweenEnabled: true }),
      expected: undefined,
    },
    {
      name: 'activates Christmas in dark mode',
      darkMode: true,
      featureFlags: buildFlags({ isChristmasEnabled: true }),
      expected: 'darkChristmas',
    },
    {
      name: 'activates Christmas when LaunchDarkly returns numeric truthy flag',
      darkMode: true,
      featureFlags: buildFlags({ isChristmasEnabled: 1 }),
      expected: 'darkChristmas',
    },
    {
      name: 'activates Christmas in light mode',
      darkMode: false,
      featureFlags: buildFlags({ isChristmasEnabled: true }),
      expected: 'lightChristmas',
    },
    {
      name: 'does not activate any seasonal theme when Halloween is enabled but dark mode is off',
      darkMode: false,
      featureFlags: buildFlags({ isHalloweenEnabled: true, isChristmasEnabled: true }),
      expected: undefined,
    },
    {
      name: 'prefers Halloween when both seasonal flags are enabled in dark mode',
      darkMode: true,
      featureFlags: buildFlags({ isHalloweenEnabled: true, isChristmasEnabled: true }),
      expected: 'darkHalloween',
    },
  ]

  test.each(cases)('$name', ({ darkMode, featureFlags, expected }) => {
    expect(resolveCowSwapTheme(darkMode, featureFlags)).toBe(expected)
  })
})
