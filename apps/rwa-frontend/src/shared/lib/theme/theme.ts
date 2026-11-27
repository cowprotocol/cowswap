import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { USER_STATE_STORAGE_KEY } from '@cowprotocol/common-const/theme'

export const THEME_PREFERENCES = ['light', 'dark', 'auto'] as const

export type Theme = Exclude<ThemePreference, 'auto'>

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const themePreferenceAtom = atomWithStorage<ThemePreference>(USER_STATE_STORAGE_KEY, 'auto', {
  getItem: () => readThemePreference(),
  setItem: (_key, preference) => writeThemePreference(preference),
  removeItem: () => writeThemePreference('auto'),
})

/** Saves the preference and applies it to the page right away */
export const setThemePreferenceAtom = atom(null, (_get, set, preference: ThemePreference) => {
  set(themePreferenceAtom, preference)
  applyTheme(preference)
})

/**
 * Runs before the first paint, so the page never flashes the other theme. Mirrors `readThemePreference` and
 * `applyTheme`: it can't import them, being inlined into the HTML.
 */
export const THEME_INIT_SCRIPT = `(function () {
  var preference = 'auto'
  try {
    var user = JSON.parse(localStorage.getItem(${JSON.stringify(USER_STATE_STORAGE_KEY)}))
    if (user && user.userDarkMode === true) preference = 'dark'
    if (user && user.userDarkMode === false) preference = 'light'
  } catch (e) {}
  var dark = preference === 'auto' ? window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches : preference === 'dark'
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
})()`

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference, window.matchMedia(DARK_SCHEME_QUERY).matches)
}

/** `auto` when CoW Swap follows the system scheme or nothing valid is stored */
export function readThemePreference(): ThemePreference {
  const userDarkMode = readUserState()?.userDarkMode

  if (userDarkMode === true) return 'dark'
  if (userDarkMode === false) return 'light'

  return 'auto'
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): Theme {
  if (preference === 'auto') return prefersDark ? 'dark' : 'light'

  return preference
}

/** Re-applies the theme when the system scheme changes */
export function watchThemeChanges(): () => void {
  const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY)
  const onChange = (): void => applyTheme(readThemePreference())

  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}

/** Keeps the other fields of the CoW Swap user state, which CoW Swap merges over its defaults on load */
export function writeThemePreference(preference: ThemePreference): void {
  const userDarkMode = preference === 'auto' ? null : preference === 'dark'

  try {
    localStorage.setItem(USER_STATE_STORAGE_KEY, JSON.stringify({ ...readUserState(), userDarkMode }))
  } catch {
    // Storage can be unavailable (private mode, blocked site data): the theme still applies to this page
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readUserState(): Record<string, unknown> | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(USER_STATE_STORAGE_KEY) ?? 'null')

    return isRecord(stored) ? stored : null
  } catch {
    return null
  }
}
