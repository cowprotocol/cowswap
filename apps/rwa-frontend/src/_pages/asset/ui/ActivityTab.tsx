'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'
import { TradeSide } from './TradeSide'

import { formatAssetAmount, formatCounterAmount, formatLegPrice } from '../lib/formatTradeLeg'
import { activityQueryAtomFamily } from '../model/accountQueryAtoms'

import type { RwaAsset } from '@/entities/asset'

import { getChainLabel, getExplorerTxUrl } from '@/shared/lib/chain'
import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

interface ActivityTabProps {
  asset: RwaAsset
  owner: string
}

export function ActivityTab({ asset, owner }: ActivityTabProps): ReactNode {
  const { data: activity, error } = useAtomValue(activityQueryAtomFamily({ owner, asset }))

  if (!activity) {
    return <StatusMessage>{error ? `Failed to load activity: ${error.message}` : 'Loading activity…'}</StatusMessage>
  }

  if (!activity.length) return <StatusMessage>You have no {asset.ticker} activity yet</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th className={styles.numeric}>Amount</th>
            <th className={styles.numeric}>Price</th>
            <th>Network</th>
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
                <td className={styles.numeric}>
                  {formatAssetAmount(item)}
                  <span className={styles.secondary}>
                    {item.side === 'buy' ? 'for' : 'to'} {formatCounterAmount(item)}
                  </span>
                </td>
                <td className={styles.numeric}>{formatLegPrice(item)}</td>
                <td>{getChainLabel(item.chainId)}</td>
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
