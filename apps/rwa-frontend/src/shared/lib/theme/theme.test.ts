import { createStore } from 'jotai'

import {
  readThemePreference,
  resolveTheme,
  setThemePreferenceAtom,
  THEME_INIT_SCRIPT,
  themePreferenceAtom,
  watchThemeChanges,
} from './theme'

function mockSystemScheme(prefersDark: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: prefersDark, addEventListener: () => undefined, removeEventListener: () => undefined }),
  })
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

  it('falls back to auto for a missing or invalid stored preference', () => {
    expect(readThemePreference()).toBe('auto')

    localStorage.setItem('rwaTheme:v1', '"sepia"')
    expect(readThemePreference()).toBe('auto')

    localStorage.setItem('rwaTheme:v1', 'not json')
    expect(readThemePreference()).toBe('auto')

    localStorage.setItem('rwaTheme:v1', '"dark"')
    expect(readThemePreference()).toBe('dark')
  })

  it('stores the preference and applies it to the page', () => {
    mockSystemScheme(true)
    const store = createStore()

    store.set(setThemePreferenceAtom, 'light')

    expect(store.get(themePreferenceAtom)).toBe('light')
    expect(localStorage.getItem('rwaTheme:v1')).toBe('"light"')
    expect(document.documentElement.dataset.theme).toBe('light')

    store.set(setThemePreferenceAtom, 'auto')

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('applies a preference saved in another tab', () => {
    mockSystemScheme(false)
    const unwatch = watchThemeChanges()

    localStorage.setItem('rwaTheme:v1', '"dark"')
    window.dispatchEvent(new StorageEvent('storage', { key: 'rwaTheme:v1', newValue: '"dark"' }))

    expect(document.documentElement.dataset.theme).toBe('dark')

    unwatch()
    localStorage.setItem('rwaTheme:v1', '"light"')
    window.dispatchEvent(new StorageEvent('storage', { key: 'rwaTheme:v1', newValue: '"light"' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it.each([
    ['"dark"', false, 'dark'],
    ['"light"', true, 'light'],
    ['"auto"', true, 'dark'],
    [null, false, 'light'],
    ['broken', true, 'dark'],
  ])('init script applies the stored %s preference (system dark: %s)', (stored, prefersDark, theme) => {
    mockSystemScheme(prefersDark)
    if (stored !== null) localStorage.setItem('rwaTheme:v1', stored)

    new Function(THEME_INIT_SCRIPT)()

    expect(document.documentElement.dataset.theme).toBe(theme)
  })
})
