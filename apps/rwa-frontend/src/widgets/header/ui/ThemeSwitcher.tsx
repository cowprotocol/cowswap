'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './ThemeSwitcher.module.css'

import { setThemePreferenceAtom, type ThemePreference, themePreferenceAtom } from '@/shared/lib/theme'

const OPTIONS: { preference: ThemePreference; title: string; icon: ReactNode }[] = [
  { preference: 'light', title: 'Light theme', icon: <SunIcon /> },
  { preference: 'dark', title: 'Dark theme', icon: <MoonIcon /> },
  { preference: 'auto', title: 'System theme', icon: <AutoIcon /> },
]

export function ThemeSwitcher(): ReactNode {
  const preference = useAtomValue(themePreferenceAtom)
  const setPreference = useSetAtom(setThemePreferenceAtom)

  return (
    <div className={styles.switcher} role="group" aria-label="Theme">
      {OPTIONS.map((option) => (
        <button
          key={option.preference}
          type="button"
          aria-pressed={option.preference === preference}
          aria-label={option.title}
          title={option.title}
          onClick={() => setPreference(option.preference)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}

function AutoIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2a6 6 0 0 1 0 12V2Z" fill="currentColor" />
    </svg>
  )
}

function MoonIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
