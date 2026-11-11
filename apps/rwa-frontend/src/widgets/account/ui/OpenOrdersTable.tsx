'use client'

import type { ReactNode } from 'react'

import { OrderStatus } from '@cowprotocol/cow-sdk'

import styles from './AccountTable.module.css'
import { CancelOrderCell } from './CancelOrderCell'
import { StatusBadge } from './StatusBadge'
import { TokenCell } from './TokenCell'

import { formatLegPrice, formatPaidAmount, formatReceivedAmount } from '../lib/formatTradeLeg'
import { ORDER_TYPE_LABELS } from '../lib/orderType'
import { getTwapProgress, type TwapProgress } from '../lib/twapProgress'
import { useNow } from '../model/useNow'

import type { OpenOrder } from '../api/openOrders'
import type { RwaTokenSummary } from '@/entities/asset'

import { formatDateTime, formatDuration } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface OpenOrderRowProps {
  order: OpenOrder
  logoUrl: string | null
  /** Unix seconds */
  now: number
}

interface OpenOrdersTableProps {
  /** `undefined` while loading */
  orders: OpenOrder[] | undefined
  error: Error | null
  emptyText: string
  getLogoUrl(token: RwaTokenSummary): string | null
}

const NOW_REFRESH_INTERVAL_MS = 30_000

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

export function OpenOrdersTable({ orders, error, emptyText, getLogoUrl }: OpenOrdersTableProps): ReactNode {
  const now = useNow(NOW_REFRESH_INTERVAL_MS)

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
            <OpenOrderRow key={order.uid} order={order} logoUrl={getLogoUrl(order.assetToken)} now={now} />
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

function formatTwapProgress({ part, partsCount, minutesLeft, isLastPart }: TwapProgress): string {
  const label = `Part ${part}/${partsCount}`
  const duration = formatDuration(minutesLeft)

  return isLastPart ? `${label} · ${duration} left` : `${label} in ${duration}`
}

function getStatusLabel({ status }: OpenOrder, twapProgress: TwapProgress | null): string {
  if (status === OrderStatus.PRESIGNATURE_PENDING) return 'Awaiting signature'

  return twapProgress?.isScheduled ? 'Scheduled' : 'Open'
}

function OpenOrderRow({ order, logoUrl, now }: OpenOrderRowProps): ReactNode {
  const twapProgress = order.twapSchedule ? getTwapProgress(order.twapSchedule, now) : null

  return (
    <tr>
      <td>
        <TokenCell token={order.assetToken} logoUrl={logoUrl} />
      </td>
      <td>
        <span className={styles.strong}>{order.side === 'buy' ? 'Buy' : 'Sell'}</span>
        <span className={styles.secondary}>{ORDER_TYPE_LABELS[order.type]}</span>
      </td>
      <td className={styles.numeric}>
        <span className={styles.strong}>{formatPaidAmount(order)}</span>
        <span className={styles.secondary}>
          for {formatReceivedAmount(order)}
          {order.twapSchedule && ' per part'}
        </span>
      </td>
      <td className={styles.numeric}>
        <span className={styles.strong}>{formatLegPrice(order)}</span>
      </td>
      <td className={styles.numeric}>
        <StatusBadge tone="neutral">{getStatusLabel(order, twapProgress)}</StatusBadge>
        <span className={styles.secondary}>
          {twapProgress ? formatTwapProgress(twapProgress) : formatOrderProgress(order)}
        </span>
      </td>
      <td className={styles.menuColumn}>
        <CancelOrderCell order={order} />
      </td>
    </tr>
  )
}
