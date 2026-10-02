import type { ReactNode } from 'react'

import styles from './Portfolio.module.css'

import { getPortfolioTotals, type Holding } from '../lib/holdings'
import { getTotalExclusions } from '../lib/totalExclusions'

import { formatUsd, shortenAddress } from '@/shared/lib/format'

interface PortfolioSummaryProps {
  owner: string
  /** `null` while loading */
  holdings: Holding[] | null
  error: Error | null
  /** Chains whose balances are missing from `holdings` */
  failedChainIds: number[]
}

export function PortfolioSummary({ owner, holdings, error, failedChainIds }: PortfolioSummaryProps): ReactNode {
  const totals = holdings && getPortfolioTotals(holdings)
  const exclusions = totals && getTotalExclusions(totals.unpricedAssets, failedChainIds)

  return (
    <section className={styles.summary} aria-label="Portfolio value">
      <p className={styles.secondary}>Wallet · {shortenAddress(owner)}</p>
      <p className={styles.secondary}>Estimated underlying value · All wallet assets · All networks</p>
      <p className={styles.total}>
        {totals ? (
          `≈ ${formatUsd(totals.value ?? (totals.assets ? null : 0))}`
        ) : (
          <span className={styles.skeletonTotal} aria-busy="true" />
        )}
      </p>
      <p className={styles.secondary}>
        {totals
          ? `${pluralize(totals.assets, 'asset')} · ${pluralize(totals.tokens, 'stock token')} · ${pluralize(totals.networks, 'network')}`
          : error
            ? `Failed to load balances: ${error.message}`
            : 'Loading balances…'}
      </p>
      {exclusions && (
        <p className={styles.warning} role="status">
          {exclusions}
        </p>
      )}
    </section>
  )
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}
