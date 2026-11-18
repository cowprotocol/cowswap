import type { ReactNode } from 'react'

import Link from 'next/link'

import { CowSaucerScene } from './CowSaucerScene'
import styles from './NotFoundPage.module.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export function NotFoundPage(): ReactNode {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <h1 id="not-found-title" className={styles.title}>
        Page not found!
      </h1>
      <p className={styles.intro}>The page you are looking for does not exist.</p>
      <Link className={styles.homeLink} href="/">
        Back home
      </Link>
      <CowSaucerScene />
    </section>
  )
}
