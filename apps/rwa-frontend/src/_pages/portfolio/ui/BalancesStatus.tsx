import type { ReactNode } from 'react'

import styles from './Portfolio.module.css'

import { formatUtcTime } from '../lib/formatUtcTime'

import type { BalancesProgress } from '../model/usePortfolio'

interface BalancesStatusProps {
  progress: BalancesProgress
  onRefresh(): void
}

export function BalancesStatus({ progress, onRefresh }: BalancesStatusProps): ReactNode {
  const { loaded, total, isLoading, updatedAt } = progress

  return (
    <div className={styles.balancesStatus}>
      {isLoading ? (
        <>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Loading balances"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={loaded}
          >
            <div className={styles.progressValue} style={{ width: `${total ? (loaded / total) * 100 : 0}%` }} />
          </div>
          <span className={styles.secondary}>
            Loading balances · {loaded} of {total} networks
          </span>
        </>
      ) : (
        updatedAt !== null && <span className={styles.secondary}>Balances updated {formatUtcTime(updatedAt)}</span>
      )}
      <button
        type="button"
        className={styles.linkButton}
        onClick={onRefresh}
        disabled={isLoading}
        aria-label="Refresh balances"
      >
        Refresh
      </button>
    </div>
  )
}
