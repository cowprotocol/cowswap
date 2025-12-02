// sort-imports-ignore // disabled for tests

jest.mock('@cowprotocol/core', () => ({
  jotaiStore: { get: jest.fn() },
}))

jest.mock('legacy/state', () => ({
  cowSwapStore: {
    getState: jest.fn(() => ({
      user: { userDarkMode: null, matchesDarkMode: false },
    })),
  },
}))

import type { FeatureFlags } from '@cowprotocol/common-const'
import { APRILS_FOOLS_FLAG_KEY, CustomTheme, resolveCustomThemeForContext } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'

import { cowSwapStore } from 'legacy/state'

import { __soundTestUtils } from './sound'

function buildFlags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
  return {
    isHalloweenEnabled: false,
    isChristmasEnabled: false,
    ...overrides,
  }
}

describe('resolveCustomThemeForContext', () => {
  it('returns undefined when no seasonal flags are enabled', () => {
    expect(resolveCustomThemeForContext(undefined, { darkModeEnabled: true })).toBeUndefined()
    expect(resolveCustomThemeForContext(buildFlags(), { darkModeEnabled: true })).toBeUndefined()
    expect(resolveCustomThemeForContext(buildFlags(), { darkModeEnabled: false })).toBeUndefined()
  })

  it('returns HALLOWEEN when Halloween is enabled and dark mode is active', () => {
    expect(resolveCustomThemeForContext(buildFlags({ isHalloweenEnabled: true }), { darkModeEnabled: true })).toBe(
      CustomTheme.HALLOWEEN,
    )
  })

  it('does not activate HALLOWEEN when dark mode is disabled', () => {
    expect(
      resolveCustomThemeForContext(buildFlags({ isHalloweenEnabled: true }), { darkModeEnabled: false }),
    ).toBeUndefined()
  })

  it('returns CHRISTMAS when only the Christmas flag is enabled', () => {
    expect(resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true }), { darkModeEnabled: true })).toBe(
      CustomTheme.CHRISTMAS,
    )
    expect(resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true }), { darkModeEnabled: false })).toBe(
      CustomTheme.CHRISTMAS,
    )
    expect(resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: 1 }), { darkModeEnabled: true })).toBe(
      CustomTheme.CHRISTMAS,
    )
  })

  it('does not activate any seasonal theme when Halloween is enabled but dark mode is disabled', () => {
    expect(
      resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), {
        darkModeEnabled: false,
      }),
    ).toBeUndefined()
  })

  it('prefers HALLOWEEN when both flags are enabled and dark mode is active', () => {
    expect(
      resolveCustomThemeForContext(buildFlags({ isChristmasEnabled: true, isHalloweenEnabled: true }), {
        darkModeEnabled: true,
      }),
    ).toBe(CustomTheme.HALLOWEEN)
  })

  it('returns undefined when feature flags object is missing and dark mode is disabled', () => {
    expect(resolveCustomThemeForContext(undefined, { darkModeEnabled: false })).toBeUndefined()
  })
})

describe('getThemeBasedSound', () => {
  const getThemeBasedSound = __soundTestUtils.getThemeBasedSound
  const jotaiGet = jotaiStore.get as jest.Mock
  const getState = cowSwapStore.getState as jest.Mock

  beforeEach(() => {
    jotaiGet.mockReturnValue({})
    getState.mockReturnValue({ user: { userDarkMode: null, matchesDarkMode: false } })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns April theme sound for SEND when flag is enabled', () => {
    jotaiGet.mockReturnValue({ [APRILS_FOOLS_FLAG_KEY]: true })

    const result = getThemeBasedSound('SEND')

    expect(result).not.toBe('/audio/send.mp3')
    expect(result.startsWith('/audio/cowswap-aprils2025-')).toBe(true)
  })

  it('keeps SUCCESS sound unchanged when April flag is enabled', () => {
    jotaiGet.mockReturnValue({ [APRILS_FOOLS_FLAG_KEY]: true })

    expect(getThemeBasedSound('SUCCESS')).toBe('/audio/success.mp3')
  })

  it('falls back to default sounds when April flag is disabled', () => {
    jotaiGet.mockReturnValue({})

    expect(getThemeBasedSound('SEND')).toBe('/audio/send.mp3')
  })

  it('returns winter sound when Christmas flag is enabled', () => {
    jotaiGet.mockReturnValue({ isChristmasEnabled: true })
    getState.mockReturnValue({ user: { userDarkMode: true, matchesDarkMode: true } })

    expect(getThemeBasedSound('SEND')).toBe('/audio/send-winterTheme.mp3')

    getState.mockReturnValue({ user: { userDarkMode: false, matchesDarkMode: false } })

    expect(getThemeBasedSound('SEND')).toBe('/audio/send-winterTheme.mp3')
  })

  it('returns Halloween sound when Halloween flag is enabled and dark mode is active', () => {
    jotaiGet.mockReturnValue({ isHalloweenEnabled: true })
    getState.mockReturnValue({ user: { userDarkMode: true, matchesDarkMode: true } })

    expect(getThemeBasedSound('SEND')).toBe('/audio/halloween.mp3')
  })

  it('falls back to default sound when Halloween flag is enabled but dark mode is off', () => {
    jotaiGet.mockReturnValue({ isHalloweenEnabled: true })
    getState.mockReturnValue({ user: { userDarkMode: false, matchesDarkMode: false } })

    expect(getThemeBasedSound('SEND')).toBe('/audio/send.mp3')
  })
})
