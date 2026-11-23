import { persistCustomThemeFlags, readPersistedCustomThemeFlags } from './theme'

const STORAGE_KEY = 'cowSwap.customThemeFlags'

describe('persisted custom theme flags', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads every custom theme flag as off when nothing is persisted', () => {
    expect(readPersistedCustomThemeFlags()).toEqual({
      isChristmasEnabled: false,
      isHalloweenEnabled: false,
      isViceThemeEnabled: false,
    })
  })

  it('reads back the custom theme flags it persisted, and no other flag', () => {
    persistCustomThemeFlags({ isViceThemeEnabled: true, isHalloweenEnabled: false, isSolanaEnabled: true })

    expect(readPersistedCustomThemeFlags()).toEqual({
      isChristmasEnabled: false,
      isHalloweenEnabled: false,
      isViceThemeEnabled: true,
    })
  })

  it('persists a truthy flag value as on', () => {
    persistCustomThemeFlags({ isChristmasEnabled: 1 })

    expect(readPersistedCustomThemeFlags().isChristmasEnabled).toBe(true)
  })

  it('turns a flag off again once it is no longer resolved as on', () => {
    persistCustomThemeFlags({ isViceThemeEnabled: true })
    persistCustomThemeFlags({})

    expect(readPersistedCustomThemeFlags().isViceThemeEnabled).toBe(false)
  })

  it.each(['not json', 'null', '"a string"', '{"isViceThemeEnabled":"yes"}'])(
    'reads %s in storage as every flag off',
    (stored) => {
      localStorage.setItem(STORAGE_KEY, stored)

      expect(readPersistedCustomThemeFlags().isViceThemeEnabled).toBe(false)
    },
  )
})
