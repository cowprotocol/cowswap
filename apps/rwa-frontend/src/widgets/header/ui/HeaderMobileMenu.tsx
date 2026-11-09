'use client'

import { type ReactNode, useCallback, useId, useRef, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import headerStyles from './Header.module.css'
import styles from './HeaderMobileMenu.module.css'
import { SETTINGS_BUTTON_ID } from './SettingsMenu'

import { isNavLinkActive, MORE_SECTIONS, NAV_LINKS } from '../config/navLinks'
import { useOpenOnPage } from '../lib/useOpenOnPage'

import { MEDIA_QUERIES } from '@/shared/config'
import { useDismissOnEscape, useDismissOnMediaQueryChange, useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ArrowUpRightIcon, ChevronDownIcon, CloseIcon, MenuIcon } from '@/shared/ui/icons'

interface MobileMenuPanelProps {
  id: string
  onNavigate(): void
}

export function HeaderMobileMenu(): ReactNode {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { isOpen, open, close } = useOpenOnPage()

  const closeOutOfRange = useCallback(() => {
    // Past the breakpoint the trigger is hidden, so the focus moves to the settings gear beside it
    if (rootRef.current?.contains(document.activeElement)) document.getElementById(SETTINGS_BUTTON_ID)?.focus()
    close()
  }, [close])

  // The panel sits under the header, and mobile browsers resize the viewport as their toolbars show and hide
  useDismissOnOutsideInteraction(isOpen, [rootRef], close, false)
  useDismissOnEscape(isOpen, close, triggerRef)
  useDismissOnMediaQueryChange(isOpen, MEDIA_QUERIES.upToLarge, closeOutOfRange)

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        className={headerStyles.iconButton}
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close() : open())}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {isOpen && <MobileMenuPanel id={menuId} onNavigate={close} />}
    </div>
  )
}

function MobileMenuPanel({ id, onNavigate }: MobileMenuPanelProps): ReactNode {
  const pathname = usePathname()
  const moreId = useId()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <nav id={id} className={styles.panel} aria-label="Menu">
      {NAV_LINKS.map(({ href, title }) => (
        <Link
          key={href}
          className={styles.item}
          href={href}
          aria-current={isNavLinkActive(href, pathname) ? 'page' : undefined}
          onClick={onNavigate}
        >
          {title}
        </Link>
      ))}
      <button
        className={styles.item}
        type="button"
        aria-expanded={isMoreOpen}
        aria-controls={isMoreOpen ? moreId : undefined}
        onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
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
                  onClick={onNavigate}
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
  )
}
