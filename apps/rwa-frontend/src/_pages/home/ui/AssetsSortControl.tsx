'use client'

import { useAtom } from 'jotai'
import type { ChangeEvent, ReactNode } from 'react'

import styles from './AssetsSortControl.module.css'

import { assetsSortAtom } from '../model/assetsSortAtom'

import { RWA_SORT_FIELDS, type RwaSortField, type RwaSortOrder } from '@/entities/asset'

const SORT_LABELS: Record<RwaSortField, string> = {
  priority: 'Popular',
  marketCap: 'Market cap',
  change24h: '24h change',
  price: 'Price',
  ticker: 'Ticker',
}

interface AssetsSortControlProps {
  onChange?(): void
}

export function AssetsSortControl({ onChange }: AssetsSortControlProps): ReactNode {
  const [{ sort, order }, setSort] = useAtom(assetsSortAtom)

  const onSortChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextSort = RWA_SORT_FIELDS.find((field) => field === event.target.value) ?? 'priority'
    const nextOrder: RwaSortOrder = nextSort === 'ticker' ? 'asc' : 'desc'

    setSort({ sort: nextSort, order: nextOrder })
    onChange?.()
  }

  const toggleOrder = (): void => {
    setSort({ sort, order: order === 'asc' ? 'desc' : 'asc' })
    onChange?.()
  }

  return (
    <div className={styles.sort}>
      <select aria-label="Sort by" value={sort} onChange={onSortChange}>
        {RWA_SORT_FIELDS.map((field) => (
          <option key={field} value={field}>
            {SORT_LABELS[field]}
          </option>
        ))}
      </select>
      <button type="button" aria-label="Toggle sort order" onClick={toggleOrder}>
        {order === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )
}
