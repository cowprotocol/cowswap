import { atom } from 'jotai'

import { load } from 'redux-localstorage-simple'

import { getCowswapTheme } from './getCowswapTheme'

function readPersistedDarkMode(): boolean | null {
  try {
    const persistedState = load({ states: ['user'], disableWarnings: true }) as {
      user?: {
        userDarkMode?: boolean | null
        matchesDarkMode?: boolean
      }
    }

    const { userDarkMode, matchesDarkMode } = persistedState?.user ?? {}

    if (typeof userDarkMode === 'boolean') {
      return userDarkMode
    }

    if (typeof matchesDarkMode === 'boolean') {
      return matchesDarkMode
    }
  } catch {
    // ignore localStorage access issues
  }

  return null
}

function readSystemDarkMode(): boolean {
  try {
    const prefersDarkScheme = window.matchMedia?.('(prefers-color-scheme: dark)')

    return prefersDarkScheme?.matches ?? false
  } catch {
    return false
  }
}

function getInitialDarkModePreference(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false
  }

  const persistedPreference = readPersistedDarkMode()

  if (persistedPreference !== null) {
    return persistedPreference
  }

  return readSystemDarkMode()
}

const initialDarkMode = getInitialDarkModePreference()

export const themeConfigAtom = atom(getCowswapTheme(initialDarkMode))
