import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Portfolio.module.css'

import { getPortfolioTotals } from '../lib/holdings'

import type { Portfolio } from '../model/usePortfolio'

import { formatUsd } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

export function AllocationCard({ portfolio: { holdings, getLogoUrl } }: { portfolio: Portfolio }): ReactNode {
  const total = holdings && getPortfolioTotals(holdings).value

  return (
    <section className={styles.card} aria-labelledby="allocation-title">
      <div>
        <h2 id="allocation-title" className={styles.cardTitle}>
          Allocation
        </h2>
        <p className={styles.secondary}>By estimated underlying value</p>
      </div>
      {!holdings ? (
        <StatusMessage>Loading…</StatusMessage>
      ) : !holdings.length ? (
        <StatusMessage>You don&apos;t hold any assets</StatusMessage>
      ) : (
        <ul className={styles.rows}>
          {holdings.map(({ asset, value }) => {
            const share = total && value !== null ? value / total : null

            return (
              <li key={asset.ticker} className={styles.allocation}>
                <Link className={styles.allocationAsset} href={`/asset/${asset.ticker}`}>
                  <TokenLogo symbol={asset.ticker} logoUrl={getLogoUrl(asset)} />
                  <span className={styles.ellipsis}>{asset.title}</span>
                </Link>
                <span className={styles.numeric}>{formatUsd(value)}</span>
                <span className={`${styles.numeric} ${styles.secondary}`}>
                  {share === null ? '—' : percentFormatter.format(share)}
                </span>
                <span className={styles.bar} aria-hidden="true">
                  <span style={{ width: `${(share ?? 0) * 100}%` }} />
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
