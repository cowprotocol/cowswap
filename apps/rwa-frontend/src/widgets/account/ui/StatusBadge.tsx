import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

export function StatusBadge({ tone, children }: { tone: 'neutral' | 'positive'; children: ReactNode }): ReactNode {
  return <span className={`${styles.badge} ${tone === 'positive' ? styles.positiveBadge : ''}`}>{children}</span>
}
