import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

import type { RwaTokenSummary } from '@/entities/asset'

import { getChainLabel } from '@/shared/lib/chain'

export function TokenCell({ token }: { token: RwaTokenSummary }): ReactNode {
  return (
    <>
      {token.symbol}
      <span className={styles.secondary}>
        {token.issuer} · {getChainLabel(token.chainId)}
      </span>
    </>
  )
}
