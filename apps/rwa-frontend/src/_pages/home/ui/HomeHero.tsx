import type { ReactNode } from 'react'

import styles from './HomeHero.module.css'

export function HomeHero(): ReactNode {
  return (
    <header className={styles.hero}>
      <h1 className={styles.heading}>Explore tokenized real-world assets</h1>
      <p className={styles.subtitle}>
        Explore third-party tokens referencing stocks and ETFs from onchain issuers across chains, with swaps powered by
        CoW Protocol.
      </p>
      <p className={styles.disclaimer}>Eligibility restrictions apply. Not investment advice.</p>
    </header>
  )
}
