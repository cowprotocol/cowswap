import { createStore } from 'jotai'

import { USER_STATE_STORAGE_KEY } from '@cowprotocol/common-const/theme'

import {
  readThemePreference,
  resolveTheme,
  setThemePreferenceAtom,
  THEME_INIT_SCRIPT,
  themePreferenceAtom,
} from './theme'

function mockSystemScheme(prefersDark: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: prefersDark, addEventListener: () => undefined, removeEventListener: () => undefined }),
  })
}

function readCowSwapUser(): unknown {
  return JSON.parse(localStorage.getItem(USER_STATE_STORAGE_KEY) ?? 'null')
}

function storeCowSwapUser(user: unknown): string {
  const value = JSON.stringify(user)

  localStorage.setItem(USER_STATE_STORAGE_KEY, value)

  return value
}

describe('theme', () => {
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('resolves auto with the system scheme', () => {
    expect(resolveTheme('auto', true)).toBe('dark')
    expect(resolveTheme('auto', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('reads the CoW Swap dark mode choice', () => {
    expect(readThemePreference()).toBe('auto')

    storeCowSwapUser({ userDarkMode: null, matchesDarkMode: true })
    expect(readThemePreference()).toBe('auto')

    storeCowSwapUser({ userDarkMode: true })
    expect(readThemePreference()).toBe('dark')

    storeCowSwapUser({ userDarkMode: false })
    expect(readThemePreference()).toBe('light')

    localStorage.setItem(USER_STATE_STORAGE_KEY, 'not json')
    expect(readThemePreference()).toBe('auto')
  })

  it('saves the preference into the CoW Swap user state, keeping its other fields', () => {
    mockSystemScheme(true)
    storeCowSwapUser({ userDarkMode: true, userLocale: 'es-ES', hooksEnabled: true })
    const store = createStore()

    store.set(setThemePreferenceAtom, 'light')

    expect(store.get(themePreferenceAtom)).toBe('light')
    expect(readCowSwapUser()).toEqual({ userDarkMode: false, userLocale: 'es-ES', hooksEnabled: true })
    expect(document.documentElement.dataset.theme).toBe('light')

    store.set(setThemePreferenceAtom, 'auto')

    expect(readCowSwapUser()).toEqual({ userDarkMode: null, userLocale: 'es-ES', hooksEnabled: true })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('creates the CoW Swap user state when CoW Swap was never opened', () => {
    createStore().set(setThemePreferenceAtom, 'dark')

    expect(readCowSwapUser()).toEqual({ userDarkMode: true })
  })

  it.each([
    [{ userDarkMode: true }, false, 'dark'],
    [{ userDarkMode: false }, true, 'light'],
    [{ userDarkMode: null }, true, 'dark'],
    [null, false, 'light'],
    ['broken', true, 'dark'],
  ])('init script applies the stored %j CoW Swap user state (system dark: %s)', (stored, prefersDark, theme) => {
    mockSystemScheme(prefersDark)
    if (stored === 'broken') localStorage.setItem(USER_STATE_STORAGE_KEY, stored)
    else if (stored !== null) storeCowSwapUser(stored)

    new Function(THEME_INIT_SCRIPT)()

    expect(document.documentElement.dataset.theme).toBe(theme)
  })
})
