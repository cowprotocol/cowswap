import type { ReactNode } from 'react'

import styles from './StatusMessage.module.css'

export function StatusMessage({ children }: { children: ReactNode }): ReactNode {
  return <p className={styles.status}>{children}</p>
}
