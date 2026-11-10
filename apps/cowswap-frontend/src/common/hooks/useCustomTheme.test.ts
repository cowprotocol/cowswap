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
    onSolanaChain?: boolean
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
    {
      name: 'activates the Solana theme on the Solana chain',
      darkMode: true,
      featureFlags: buildFlags({ isSolanaThemeEnabled: true }),
      onSolanaChain: true,
      expected: 'darkSolana',
    },
    {
      name: 'activates the Solana theme in light mode too',
      darkMode: false,
      featureFlags: buildFlags({ isSolanaThemeEnabled: true }),
      onSolanaChain: true,
      expected: 'darkSolana',
    },
    {
      name: 'skips the Solana theme off the Solana chain',
      darkMode: true,
      featureFlags: buildFlags({ isSolanaThemeEnabled: true }),
      onSolanaChain: false,
      expected: undefined,
    },
    {
      name: 'skips the Solana theme when its flag is off',
      darkMode: true,
      featureFlags: buildFlags(),
      onSolanaChain: true,
      expected: undefined,
    },
    {
      name: 'prefers Solana over a seasonal theme on the Solana chain',
      darkMode: true,
      featureFlags: buildFlags({ isSolanaThemeEnabled: true, isHalloweenEnabled: true }),
      onSolanaChain: true,
      expected: 'darkSolana',
    },
  ]

  test.each(cases)('$name', ({ darkMode, featureFlags, onSolanaChain, expected }) => {
    expect(resolveCowSwapTheme(darkMode, featureFlags, onSolanaChain)).toBe(expected)
  })
})
