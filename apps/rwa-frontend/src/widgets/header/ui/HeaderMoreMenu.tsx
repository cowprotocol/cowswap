'use client'

import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useState } from 'react'

import styles from './HeaderMoreMenu.module.css'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { ChevronDownIcon } from '@/shared/ui/icons'

const SECTIONS = [
  {
    title: 'Legal',
    links: [
      { href: 'https://cow.fi/legal/cowswap-terms', title: 'Terms and Conditions' },
      { href: 'https://cow.fi/legal/cowswap-privacy-policy', title: 'Privacy Policy' },
      { href: 'https://cow.fi/legal/cowswap-cookie-policy', title: 'Cookie Policy' },
    ],
  },
]

export function HeaderMoreMenu(): ReactNode {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  useDismissOnOutsideInteraction(isOpen, [rootRef], close)

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
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        More
        <ChevronDownIcon className={styles.chevron} />
      </button>
      {isOpen && (
        <div id={menuId} className={styles.menu}>
          {SECTIONS.map(({ title, links }) => (
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
                </a>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
