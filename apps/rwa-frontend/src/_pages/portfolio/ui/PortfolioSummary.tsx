import type { ReactNode } from 'react'

import { BalancesStatus } from './BalancesStatus'
import styles from './Portfolio.module.css'

import { getPortfolioTotals, type Holding } from '../lib/holdings'
import { getTotalExclusions } from '../lib/totalExclusions'

import type { BalancesProgress } from '../model/usePortfolio'

import { formatUsd, shortenAddress } from '@/shared/lib/format'

interface PortfolioSummaryProps {
  owner: string
  /** `null` while loading */
  holdings: Holding[] | null
  error: Error | null
  /** Chains whose balances are missing from `holdings` */
  failedChainIds: number[]
  arePricesLoading: boolean
  balancesProgress: BalancesProgress
  onRefreshBalances(): void
}

export function PortfolioSummary({
  owner,
  holdings,
  error,
  failedChainIds,
  arePricesLoading,
  balancesProgress,
  onRefreshBalances,
}: PortfolioSummaryProps): ReactNode {
  const totals = holdings && getPortfolioTotals(holdings)
  const exclusions = totals && getTotalExclusions(arePricesLoading ? null : totals.unpricedAssets, failedChainIds)
  const isValueLoading = !totals || (arePricesLoading && totals.assets > 0)

  return (
    <section className={styles.summary} aria-label="Portfolio value">
      <p className={styles.secondary}>Wallet · {shortenAddress(owner)}</p>
      <p className={styles.secondary}>Estimated underlying value · All wallet assets · All networks</p>
      <p className={styles.total}>
        {isValueLoading ? (
          <span className={styles.skeletonTotal} aria-busy="true" />
        ) : (
          `≈ ${formatUsd(totals.value ?? (totals.assets ? null : 0))}`
        )}
      </p>
      <p className={styles.secondary}>
        {totals
          ? `${pluralize(totals.assets, 'asset')} · ${pluralize(totals.tokens, 'stock token')} · ${pluralize(totals.networks, 'network')}`
          : error
            ? `Failed to load balances: ${error.message}`
            : 'Loading balances…'}
      </p>
      <BalancesStatus progress={balancesProgress} onRefresh={onRefreshBalances} />
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
