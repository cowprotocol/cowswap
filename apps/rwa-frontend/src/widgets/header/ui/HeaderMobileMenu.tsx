'use client'

import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './HeaderMobileMenu.module.css'

import { isNavLinkActive, MORE_SECTIONS, NAV_LINKS, SWAP_HREF } from '../config/navLinks'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ArrowUpRightIcon, ChevronDownIcon, CloseIcon, MenuIcon } from '@/shared/ui/icons'

const MENU_QUERY = '(max-width: 1280px)'

export function HeaderMobileMenu(): ReactNode {
  const pathname = usePathname()
  const menuId = useId()
  const moreId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const close = useCallback(() => {
    setIsOpen(false)
    setIsMoreOpen(false)
  }, [])

  // The panel sits under the header, and mobile browsers resize the viewport as their toolbars show and hide
  useDismissOnOutsideInteraction(isOpen, [rootRef], close, false)
  useBodyScrollLock(isOpen, MENU_QUERY)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Escape' || !isOpen) return

    event.preventDefault()
    close()
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={styles.root} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
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
          <a className={styles.item} href={SWAP_HREF}>
            Swap
          </a>
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
                  <h3 className={styles.sectionTitle}>{title}</h3>
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
