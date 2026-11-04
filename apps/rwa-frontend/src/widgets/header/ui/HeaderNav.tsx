'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './Header.module.css'
import { HeaderMoreMenu } from './HeaderMoreMenu'

import { isNavLinkActive, NAV_LINKS } from '../config/navLinks'

export function HeaderNav(): ReactNode {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      {NAV_LINKS.map(({ href, title }) => {
        const isActive = isNavLinkActive(href, pathname)

        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.activeLink : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            {title}
          </Link>
        )
      })}
      <HeaderMoreMenu />
    </nav>
  )
}
