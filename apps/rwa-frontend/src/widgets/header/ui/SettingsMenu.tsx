'use client'

import { useSetAtom } from 'jotai'
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './SettingsMenu.module.css'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { setThemePreferenceAtom, useIsDarkTheme } from '@/shared/lib/theme'

export function SettingsMenu(): ReactNode {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const isDark = useIsDarkTheme()
  const setThemePreference = useSetAtom(setThemePreferenceAtom)

  const close = useCallback(() => setIsOpen(false), [])

  useDismissOnOutsideInteraction(isOpen, [rootRef], close)

  useEffect(() => {
    if (isOpen) itemRef.current?.focus()
  }, [isOpen])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape' || !isOpen) return

    event.preventDefault()
    close()
    triggerRef.current?.focus()
  }

  const toggleTheme = (): void => {
    setThemePreference(isDark ? 'light' : 'dark')
    close()
  }

  return (
    <div ref={rootRef} className={styles.root} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label="Settings"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <SettingsIcon />
      </button>
      {isOpen && (
        <ul id={menuId} className={styles.menu} role="menu" aria-label="Settings">
          <li role="none">
            <button ref={itemRef} className={styles.item} type="button" role="menuitem" onClick={toggleTheme}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
              <ArrowRightIcon />
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

function ArrowRightIcon(): ReactNode {
  return (
    <svg className={styles.arrow} width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path
        d="M12.05 9.34H0V7.067h12.05l-5.47-5.47L8.203 0l8.204 8.203-8.204 8.204-1.622-1.598 5.468-5.468Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SettingsIcon(): ReactNode {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.55 11.25a1.238 1.238 0 0 0 .247 1.365l.045.045a1.5 1.5 0 0 1-1.06 2.562 1.5 1.5 0 0 1-1.062-.44l-.045-.044a1.238 1.238 0 0 0-1.365-.248 1.238 1.238 0 0 0-.75 1.133v.127a1.5 1.5 0 1 1-3 0v-.068a1.238 1.238 0 0 0-.81-1.132 1.238 1.238 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.123-2.122l.046-.045a1.238 1.238 0 0 0 .247-1.365 1.238 1.238 0 0 0-1.132-.75H2.25a1.5 1.5 0 1 1 0-3h.067a1.237 1.237 0 0 0 1.133-.81 1.237 1.237 0 0 0-.248-1.365l-.044-.045A1.5 1.5 0 1 1 5.28 3.217l.045.046a1.237 1.237 0 0 0 1.365.247h.06a1.237 1.237 0 0 0 .75-1.132V2.25a1.5 1.5 0 0 1 3 0v.067a1.238 1.238 0 0 0 .75 1.133 1.237 1.237 0 0 0 1.365-.248l.045-.044a1.5 1.5 0 1 1 2.123 2.122l-.045.045a1.237 1.237 0 0 0-.248 1.365v.06a1.237 1.237 0 0 0 1.133.75h.127a1.5 1.5 0 0 1 0 3h-.068a1.238 1.238 0 0 0-1.132.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
