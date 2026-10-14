import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const THEME_PREFERENCES = ['light', 'dark', 'auto'] as const

export type Theme = Exclude<ThemePreference, 'auto'>

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

const THEME_STORAGE_KEY = 'rwaTheme:v1'
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const themePreferenceAtom = atomWithStorage<ThemePreference>(THEME_STORAGE_KEY, 'auto')

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
    var stored = JSON.parse(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}))
    if (${JSON.stringify(THEME_PREFERENCES)}.indexOf(stored) !== -1) preference = stored
  } catch (e) {}
  var dark = preference === 'auto' ? window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches : preference === 'dark'
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
})()`

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference, window.matchMedia(DARK_SCHEME_QUERY).matches)
}

/** `auto` when nothing valid is stored */
export function readThemePreference(): ThemePreference {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? 'null')

    return THEME_PREFERENCES.find((preference) => preference === stored) ?? 'auto'
  } catch {
    return 'auto'
  }
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): Theme {
  if (preference === 'auto') return prefersDark ? 'dark' : 'light'

  return preference
}

/** Follows the system color scheme while the preference is `auto` */
export function watchSystemTheme(): () => void {
  const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY)
  const onChange = (): void => applyTheme(readThemePreference())

  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}
