import type { ReactNode } from 'react'

import styles from './Portfolio.module.css'

import { getPortfolioTotals, type Holding } from '../lib/holdings'
import { getTotalExclusions } from '../lib/totalExclusions'

import { formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { Tooltip } from '@/shared/ui/tooltip'

const VALUATION_HINT = 'Estimated from token market prices. Actual sale proceeds may differ.'

interface PortfolioSummaryProps {
  /** `null` while loading */
  holdings: Holding[] | null
  error: Error | null
  /** Chains whose balances are missing from `holdings` */
  failedChainIds: number[]
  arePricesLoading: boolean
}

export function PortfolioSummary({
  holdings,
  error,
  failedChainIds,
  arePricesLoading,
}: PortfolioSummaryProps): ReactNode {
  const totals = holdings && getPortfolioTotals(holdings)
  const exclusions = totals && getTotalExclusions(arePricesLoading ? null : totals.unpricedAssets, failedChainIds)
  const isValueLoading = !totals || (arePricesLoading && totals.assets > 0)

  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Portfolio</h1>
        <p className={styles.intro}>
          {totals
            ? `${pluralize(totals.assets, 'asset')} · ${pluralize(totals.tokens, 'stock token')}`
            : error
              ? `Failed to load balances: ${error.message}`
              : 'Loading balances…'}
        </p>
      </div>
      <section className={styles.summary} aria-label="Portfolio value">
        <Tooltip className={styles.valueLabel} content={VALUATION_HINT}>
          Estimated underlying value
          <InfoIcon />
        </Tooltip>
        <p className={styles.total}>
          {isValueLoading ? (
            <span className={styles.skeletonTotal} aria-busy="true" />
          ) : (
            <TotalValue value={totals.value ?? (totals.assets ? null : 0)} />
          )}
        </p>
        {exclusions && (
          <p className={styles.warning} role="status">
            {exclusions}
          </p>
        )}
      </section>
    </header>
  )
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

function TotalValue({ value }: { value: number | null }): ReactNode {
  const formatted = formatUsd(value)
  const decimalIndex = formatted.lastIndexOf('.')

  if (value === null || decimalIndex === -1) return formatted

  return (
    <>
      ≈ {formatted.slice(0, decimalIndex)}
      <span className={styles.cents}>{formatted.slice(decimalIndex)}</span>
    </>
  )
}
