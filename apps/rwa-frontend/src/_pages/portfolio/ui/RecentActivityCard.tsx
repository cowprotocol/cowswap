import type { ReactNode } from 'react'

import styles from './Portfolio.module.css'

import type { Portfolio } from '../model/usePortfolio'

import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'
import { formatAssetAmount } from '@/widgets/account'

const RECENT_ACTIVITY_COUNT = 3

interface RecentActivityCardProps {
  portfolio: Portfolio
  onViewAll(): void
}

export function RecentActivityCard({
  portfolio: { recentActivity, getAsset, getLogoUrl },
  onViewAll,
}: RecentActivityCardProps): ReactNode {
  return (
    <section className={styles.card} aria-labelledby="recent-activity-title">
      <div className={styles.cardHeader}>
        <h2 id="recent-activity-title" className={styles.cardTitle}>
          Recent activity
        </h2>
        <button type="button" className={styles.linkButton} onClick={onViewAll}>
          View all activity →
        </button>
      </div>
      {!recentActivity ? (
        <StatusMessage>Loading…</StatusMessage>
      ) : !recentActivity.length ? (
        <StatusMessage>No activity yet</StatusMessage>
      ) : (
        <ul className={styles.rows}>
          {recentActivity.slice(0, RECENT_ACTIVITY_COUNT).map((item) => {
            const asset = getAsset(item.assetToken)
            const isBuy = item.side === 'buy'

            return (
              <li key={item.id} className={styles.activity}>
                <TokenLogo
                  symbol={item.assetToken.symbol}
                  logoUrl={asset ? getLogoUrl(asset, item.assetToken) : null}
                  chainId={item.chainId}
                />
                <span className={styles.activityTitle}>
                  <span className={isBuy ? styles.buy : styles.sell}>
                    {isBuy ? '↙ Bought' : '↗ Sold'} {asset?.title ?? item.assetToken.symbol}
                  </span>
                  <span className={styles.secondary}>{formatDateTime(item.timestamp)}</span>
                </span>
                <span className={styles.activityAmount}>
                  <span className={styles.numeric}>{formatAssetAmount(item)}</span>
                  <span className={styles.badge}>Completed</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
