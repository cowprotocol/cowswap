import type { CowSwapTheme } from '@cowprotocol/ui'

import { resolveCowSwapTheme } from './useCustomTheme'

type FeatureFlags = Record<string, boolean | number | undefined>

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
      name: 'activates Christmas in light mode',
      darkMode: false,
      featureFlags: buildFlags({ isChristmasEnabled: true }),
      expected: 'lightChristmas',
    },
    {
      name: 'falls back to Christmas when Halloween is unavailable due to light mode',
      darkMode: false,
      featureFlags: buildFlags({ isHalloweenEnabled: true, isChristmasEnabled: true }),
      expected: 'lightChristmas',
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
