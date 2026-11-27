'use client'

import { type ReactNode, useCallback, useId, useRef, useState } from 'react'

import styles from './HeaderMoreMenu.module.css'

import { MORE_SECTIONS } from '../config/navLinks'

import { useDismissOnEscape, useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ChevronDownIcon } from '@/shared/ui/icons'

export function HeaderMoreMenu(): ReactNode {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  useDismissOnOutsideInteraction(isOpen, [rootRef], close)
  useDismissOnEscape(isOpen, close, triggerRef)

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        More
        <ChevronDownIcon className={styles.chevron} />
      </button>
      {isOpen && (
        <div id={menuId} className={styles.menu}>
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
                </a>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
