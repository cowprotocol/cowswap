'use client'

import type { ReactNode } from 'react'

import { OrderStatus } from '@cowprotocol/cow-sdk'

import styles from './AccountTable.module.css'
import { CancelOrderCell } from './CancelOrderCell'
import { StatusBadge } from './StatusBadge'
import { TokenCell } from './TokenCell'

import { formatLegPrice, formatPaidAmount, formatReceivedAmount } from '../lib/formatTradeLeg'

import type { OpenOrder } from '../api/openOrders'
import type { RwaTokenSummary } from '@/entities/asset'

import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface OpenOrdersTableProps {
  /** `undefined` while loading */
  orders: OpenOrder[] | undefined
  error: Error | null
  emptyText: string
  getLogoUrl(token: RwaTokenSummary): string | null
}

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

export function OpenOrdersTable({ orders, error, emptyText, getLogoUrl }: OpenOrdersTableProps): ReactNode {
  if (!orders) {
    return <StatusMessage>{error ? `Failed to load orders: ${error.message}` : 'Loading orders…'}</StatusMessage>
  }

  if (!orders.length) return <StatusMessage>{emptyText}</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.wide}>Stock token / issuer</th>
            <th>Type</th>
            <th className={styles.numeric}>Amount</th>
            <th className={styles.numeric}>Executes at</th>
            <th className={styles.numeric}>Status</th>
            <th className={styles.menuColumn}>
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.uid}>
              <td>
                <TokenCell token={order.assetToken} logoUrl={getLogoUrl(order.assetToken)} />
              </td>
              <td>
                <span className={styles.strong}>{order.side === 'buy' ? 'Buy' : 'Sell'}</span>
                <span className={styles.secondary}>{order.isLimit ? 'Limit' : 'Swap'}</span>
              </td>
              <td className={styles.numeric}>
                <span className={styles.strong}>{formatPaidAmount(order)}</span>
                <span className={styles.secondary}>for {formatReceivedAmount(order)}</span>
              </td>
              <td className={styles.numeric}>
                <span className={styles.strong}>{formatLegPrice(order)}</span>
              </td>
              <td className={styles.numeric}>
                <StatusBadge tone="neutral">
                  {order.status === OrderStatus.PRESIGNATURE_PENDING ? 'Awaiting signature' : 'Open'}
                </StatusBadge>
                <span className={styles.secondary}>{formatOrderProgress(order)}</span>
              </td>
              <td className={styles.menuColumn}>
                <CancelOrderCell order={order} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatOrderProgress({ filledFraction, validTo }: OpenOrder): string {
  const expires = `Expires ${formatDateTime(validTo)}`

  return filledFraction > 0 ? `${percentFormatter.format(filledFraction)} filled · ${expires}` : expires
}
