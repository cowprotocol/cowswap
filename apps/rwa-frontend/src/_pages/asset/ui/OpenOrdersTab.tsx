'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { OrderStatus } from '@cowprotocol/cow-sdk'

import styles from './AccountTable.module.css'
import { TradeSide } from './TradeSide'

import { formatAssetAmount, formatCounterAmount, formatLegPrice } from '../lib/formatTradeLeg'
import { openOrdersQueryAtomFamily } from '../model/accountQueryAtoms'

import type { RwaAsset } from '@/entities/asset'

import { getChainLabel } from '@/shared/lib/chain'
import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface OpenOrdersTabProps {
  asset: RwaAsset
  owner: string
}

const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

export function OpenOrdersTab({ asset, owner }: OpenOrdersTabProps): ReactNode {
  const { data: orders, error } = useAtomValue(openOrdersQueryAtomFamily({ owner, asset }))

  if (!orders) {
    return <StatusMessage>{error ? `Failed to load orders: ${error.message}` : 'Loading orders…'}</StatusMessage>
  }

  if (!orders.length) return <StatusMessage>You have no open {asset.ticker} orders</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Side</th>
            <th className={styles.numeric}>Amount</th>
            <th className={styles.numeric}>Limit price</th>
            <th className={styles.numeric}>Filled</th>
            <th>Network</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.uid}>
              <td>
                <TradeSide side={order.side} />
                {order.status === OrderStatus.PRESIGNATURE_PENDING && (
                  <span className={styles.secondary}>Awaiting signature</span>
                )}
              </td>
              <td className={styles.numeric}>
                {formatAssetAmount(order)}
                <span className={styles.secondary}>
                  {order.side === 'buy' ? 'for' : 'to'} {formatCounterAmount(order)}
                </span>
              </td>
              <td className={styles.numeric}>{formatLegPrice(order)}</td>
              <td className={styles.numeric}>{percentFormatter.format(order.filledFraction)}</td>
              <td>{getChainLabel(order.chainId)}</td>
              <td>{formatDateTime(order.validTo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
