'use client'

import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'
import { TokenCell } from './TokenCell'
import { TradeSide } from './TradeSide'

import { formatAssetAmount, formatCounterAmount, formatLegPrice } from '../lib/formatTradeLeg'

import type { Activity } from '../api/activity'

import { getExplorerTxUrl } from '@/shared/lib/chain'
import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface ActivityTableProps {
  /** `undefined` while loading */
  activity: Activity[] | undefined
  error: Error | null
  emptyText: string
}

export function ActivityTable({ activity, error, emptyText }: ActivityTableProps): ReactNode {
  if (!activity) {
    return <StatusMessage>{error ? `Failed to load activity: ${error.message}` : 'Loading activity…'}</StatusMessage>
  }

  if (!activity.length) return <StatusMessage>{emptyText}</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Token</th>
            <th className={styles.numeric}>Amount</th>
            <th className={styles.numeric}>Price</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((item) => {
            const txUrl = item.txHash ? getExplorerTxUrl(item.chainId, item.txHash) : null

            return (
              <tr key={item.id}>
                <td>{formatDateTime(item.timestamp)}</td>
                <td>
                  <TradeSide side={item.side} />
                </td>
                <td>
                  <TokenCell token={item.assetToken} />
                </td>
                <td className={styles.numeric}>
                  {formatAssetAmount(item)}
                  <span className={styles.secondary}>
                    {item.side === 'buy' ? 'for' : 'to'} {formatCounterAmount(item)}
                  </span>
                </td>
                <td className={styles.numeric}>{formatLegPrice(item)}</td>
                <td>
                  {txUrl ? (
                    <a className={styles.link} href={txUrl} target="_blank" rel="noopener noreferrer">
                      View ↗
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
