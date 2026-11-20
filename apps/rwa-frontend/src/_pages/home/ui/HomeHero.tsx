import type { ReactNode } from 'react'

import styles from './HomeHero.module.css'

import { STOCKS_PAGE_HEADING } from '@/shared/config'

export function HomeHero(): ReactNode {
  return (
    <header className={styles.hero}>
      <h1 className={styles.heading}>{STOCKS_PAGE_HEADING}</h1>
      <p className={styles.subtitle}>
        Explore tokens from independent issuers across chains, with swaps powered by CoW Protocol.
      </p>
      <p className={styles.disclaimer}>Eligibility restrictions apply. Not investment advice.</p>
    </header>
  )
}
