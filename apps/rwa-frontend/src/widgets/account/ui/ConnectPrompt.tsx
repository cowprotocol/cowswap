import type { ReactNode } from 'react'

import styles from './ConnectPrompt.module.css'

import { ConnectButton } from '@/features/connect-wallet'

export function ConnectPrompt({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className={styles.prompt}>
      <span>{children}</span>
      <ConnectButton />
    </div>
  )
}
