'use client'

import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'
import { ChainLabel } from './ChainLabel'
import { RowMenu } from './RowMenu'
import { StatusBadge } from './StatusBadge'

import { formatActivityDate } from '../lib/formatActivityDate'
import { formatPaidAmount, formatReceivedAmount } from '../lib/formatTradeLeg'
import { ORDER_TYPE_LABELS } from '../lib/orderType'

import type { Activity } from '../api/activity'
import type { RwaTokenSummary } from '@/entities/asset'

import { getCowExplorerOrderUrl, getExplorerTxUrl } from '@/shared/lib/chain'
import { ArrowUpRightIcon } from '@/shared/ui/icons'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

interface ActivityTableProps {
  /** `undefined` while loading */
  activity: Activity[] | undefined
  error: Error | null
  emptyText: string
  getLogoUrl(token: RwaTokenSummary): string | null
}

export function ActivityTable({ activity, error, emptyText, getLogoUrl }: ActivityTableProps): ReactNode {
  if (!activity) {
    return <StatusMessage>{error ? `Failed to load activity: ${error.message}` : 'Loading activity…'}</StatusMessage>
  }

  if (!activity.length) return <StatusMessage>{emptyText}</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.activityColumn}>Activity</th>
            <th className={`${styles.numeric} ${styles.activityAmountColumn}`}>Paid → received</th>
            <th className={`${styles.numeric} ${styles.sorted} ${styles.activityDateColumn}`} aria-sort="descending">
              <span aria-hidden="true">↓</span> Date
            </th>
            <th className={`${styles.numeric} ${styles.activityStatusColumn}`}>Status</th>
            <th className={styles.menuColumn}>
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {activity.map((item) => (
            <ActivityRow key={item.id} item={item} logoUrl={getLogoUrl(item.assetToken)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ActivityRow({ item, logoUrl }: { item: Activity; logoUrl: string | null }): ReactNode {
  const { assetToken, side } = item
  const explorerUrl = getActivityExplorerUrl(item)
  const sideLabel = side === 'buy' ? 'Buy' : 'Sell'

  return (
    <tr>
      <td>
        <div className={styles.identity}>
          <span className={`${styles.sideIcon} ${side === 'buy' ? styles.buyIcon : styles.sellIcon}`}>
            <ArrowUpRightIcon />
          </span>
          <div className={styles.stack}>
            <span className={`${styles.strong} ${styles.inlineLogo}`}>
              {sideLabel}
              <TokenLogo symbol={assetToken.symbol} logoUrl={logoUrl} size="small" />
              {assetToken.symbol}
            </span>
            <span className={`${styles.secondary} ${styles.inlineLogo}`}>
              {getOrderTypeLabel(item)} · {assetToken.issuer} · <ChainLabel chainId={assetToken.chainId} />
            </span>
          </div>
        </div>
      </td>
      <td className={styles.numeric}>
        <span className={styles.strong}>{formatPaidAmount(item)} →</span>
        <span className={styles.secondary}>{formatReceivedAmount(item)}</span>
      </td>
      <td className={styles.numeric}>
        <span className={styles.strong}>{formatActivityDate(item.timestamp)}</span>
      </td>
      <td className={styles.numeric}>
        <StatusBadge tone="positive">Completed</StatusBadge>
      </td>
      <td className={styles.menuColumn}>
        {explorerUrl && (
          <RowMenu
            label={`${sideLabel} ${assetToken.symbol} actions`}
            items={[
              {
                label: explorerUrl.label,
                onSelect: () => window.open(explorerUrl.url, '_blank', 'noopener,noreferrer'),
              },
            ]}
          />
        )}
      </td>
    </tr>
  )
}

function getActivityExplorerUrl({ chainId, orderUid, txHash }: Activity): { label: string; url: string } | null {
  const orderUrl = orderUid ? getCowExplorerOrderUrl(chainId, orderUid) : null
  if (orderUrl) return { label: 'View on CoW Explorer', url: orderUrl }

  const txUrl = txHash ? getExplorerTxUrl(chainId, txHash) : null

  return txUrl ? { label: 'View transaction', url: txUrl } : null
}

function getOrderTypeLabel({ orderType, twapPart }: Activity): string {
  return twapPart ? `TWAP part ${twapPart.number}/${twapPart.count}` : ORDER_TYPE_LABELS[orderType]
}
