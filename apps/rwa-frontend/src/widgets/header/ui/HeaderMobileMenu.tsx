'use client'

import { type ReactNode, type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './HeaderMobileMenu.module.css'
import { SETTINGS_BUTTON_ID } from './SettingsMenu'

import { isNavLinkActive, MORE_SECTIONS, NAV_LINKS } from '../config/navLinks'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import { useDismissOnMediaQueryExit } from '../lib/useDismissOnMediaQueryExit'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ArrowUpRightIcon, ChevronDownIcon, CloseIcon, MenuIcon } from '@/shared/ui/icons'

const MENU_QUERY = '(max-width: 1280px)'

export function HeaderMobileMenu(): ReactNode {
  const pathname = usePathname()
  const menuId = useId()
  const moreId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // The page the menu was opened on: the header outlives navigation, so Back and Forward must close it
  const [openOn, setOpenOn] = useState<string | null>(null)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isOpen = openOn === pathname

  if (openOn !== null && !isOpen) setOpenOn(null)

  const close = useCallback(() => setOpenOn(null), [])

  const closeOutOfRange = useCallback(() => {
    // Past the breakpoint the trigger is hidden, so the focus moves to the settings gear beside it
    if (rootRef.current?.contains(document.activeElement)) document.getElementById(SETTINGS_BUTTON_ID)?.focus()
    close()
  }, [close])

  const open = (): void => {
    setOpenOn(pathname)
    setIsMoreOpen(false)
  }

  // The panel sits under the header, and mobile browsers resize the viewport as their toolbars show and hide
  useDismissOnOutsideInteraction(isOpen, [rootRef], close, false)
  useDismissOnMediaQueryExit(isOpen, MENU_QUERY, closeOutOfRange)
  useBodyScrollLock(isOpen, MENU_QUERY)
  useCloseOnEscape(isOpen, close, triggerRef)

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close() : open())}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {isOpen && (
        <nav id={menuId} className={styles.panel} aria-label="Menu">
          {NAV_LINKS.map(({ href, title }) => {
            const isActive = isNavLinkActive(href, pathname)

            return (
              <Link
                key={href}
                className={styles.item}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                onClick={close}
              >
                {title}
              </Link>
            )
          })}
          <button
            className={styles.item}
            type="button"
            aria-expanded={isMoreOpen}
            aria-controls={isMoreOpen ? moreId : undefined}
            onClick={() => setIsMoreOpen((open) => !open)}
          >
            More
            <ChevronDownIcon className={styles.chevron} />
          </button>
          {isMoreOpen && (
            <div id={moreId} className={styles.more}>
              {MORE_SECTIONS.map(({ title, links }) => (
                <section key={title} className={styles.section} aria-label={title}>
                  {links.map(({ href, title }) => (
                    <a
                      key={href}
                      className={styles.link}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                    >
                      {title}
                      <ArrowUpRightIcon className={styles.external} />
                    </a>
                  ))}
                </section>
              ))}
            </div>
          )}
        </nav>
      )}
    </div>
  )
}

/** Closes the menu on Escape wherever the focus is, and returns the focus to `triggerRef` */
function useCloseOnEscape(isOpen: boolean, close: () => void, triggerRef: RefObject<HTMLButtonElement | null>): void {
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      // The full-screen search, which can open over the menu, handles its Escape first
      if (event.key !== 'Escape' || event.defaultPrevented) return

      event.preventDefault()
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close, triggerRef])
}
