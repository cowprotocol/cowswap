'use client'

import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useState } from 'react'

import { COW_DAO_LINK, COW_PRODUCT_LINKS, type CowProductId } from '@cowprotocol/common-const/cowLinks'

import Link from 'next/link'

import styles from './ProductsMenu.module.css'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { CowLogo } from '@/shared/ui/cow-logo'
import { ArrowUpRightIcon } from '@/shared/ui/icons'

const MENU_LOGO_HEIGHT = 16

const CURRENT_PRODUCT: CowProductId = 'cowRwa'

export function ProductsMenu(): ReactNode {
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
        aria-label="CoW products"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <GridIcon />
      </button>
      {isOpen && (
        <nav id={menuId} className={styles.menu} aria-label="CoW products">
          <ExternalItem label={COW_DAO_LINK.label} href={COW_DAO_LINK.href} onClick={close} />
          <hr className={styles.divider} />
          {COW_PRODUCT_LINKS.map(({ id, label, href }) =>
            id === CURRENT_PRODUCT ? (
              <Link
                key={id}
                className={`${styles.item} ${styles.current}`}
                href="/"
                aria-current="page"
                onClick={close}
              >
                <CowLogo className={styles.logo} height={MENU_LOGO_HEIGHT} />
                <span className={styles.label}>{label}</span>
              </Link>
            ) : (
              <ExternalItem key={id} label={label} href={href} onClick={close} />
            ),
          )}
        </nav>
      )}
    </div>
  )
}

function ExternalItem({ label, href, onClick }: { label: string; href: string; onClick: () => void }): ReactNode {
  return (
    <a className={styles.item} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      <CowLogo className={styles.logo} height={MENU_LOGO_HEIGHT} />
      <span className={styles.label}>{label}</span>
      <ArrowUpRightIcon className={styles.arrow} />
    </a>
  )
}

function GridIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      {[2, 9, 16].flatMap((cy) => [2, 9, 16].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.9" />))}
    </svg>
  )
}
