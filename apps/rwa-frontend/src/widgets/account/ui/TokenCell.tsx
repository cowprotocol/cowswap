import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

import type { RwaTokenSummary } from '@/entities/asset'

import { getChainLabel } from '@/shared/lib/chain'
import { TokenLogo } from '@/shared/ui/token-logo'

interface TokenCellProps {
  token: RwaTokenSummary
  logoUrl: string | null
}

export function TokenCell({ token, logoUrl }: TokenCellProps): ReactNode {
  return (
    <div className={styles.identity}>
      <TokenLogo symbol={token.symbol} logoUrl={logoUrl} chainId={token.chainId} />
      <div className={styles.stack}>
        <span className={styles.strong}>
          {token.symbol} · {token.issuer}
        </span>
        <span className={styles.secondary}>{getChainLabel(token.chainId)}</span>
      </div>
    </div>
  )
}
