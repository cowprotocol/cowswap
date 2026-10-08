import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './AssetsTable.module.css'

import type { RwaAssetWithMarket } from '../model/types'

import { formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'

interface AssetsTableProps {
  assets: RwaAssetWithMarket[]
}

export function AssetsTable({ assets }: AssetsTableProps): ReactNode {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Asset</th>
          <th className={styles.numeric}>Price</th>
          <th className={styles.numeric}>24h</th>
          <th className={`${styles.numeric} ${styles.optional}`}>Market cap</th>
        </tr>
      </thead>
      <tbody>
        {assets.map((asset) => (
          <tr key={asset.ticker}>
            <td>
              <Link className={styles.assetLink} href={`/asset/${asset.ticker}`}>
                <span className={styles.ticker}>{asset.ticker}</span>
                <span className={styles.title}>{asset.title}</span>
              </Link>
            </td>
            <td className={styles.numeric}>{formatUsd(asset.market?.price)}</td>
            <td className={`${styles.numeric} ${changeClassName(asset.market?.change24h)}`}>
              {formatPercent(asset.market?.change24h)}
            </td>
            <td className={`${styles.numeric} ${styles.optional}`}>{formatCompactUsd(asset.market?.marketCap)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function changeClassName(change: number | null | undefined): string {
  if (!change) return ''

  return change > 0 ? styles.positive : styles.negative
}
