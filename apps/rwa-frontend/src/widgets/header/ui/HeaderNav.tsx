'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './Header.module.css'

const LINKS = [
  { href: '/', title: 'Explore' },
  { href: '/portfolio', title: 'Portfolio' },
]

export function HeaderNav(): ReactNode {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      {LINKS.map(({ href, title }) => {
        const isActive = href === '/' ? pathname === '/' || pathname.startsWith('/asset/') : pathname.startsWith(href)

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
    </nav>
  )
}
