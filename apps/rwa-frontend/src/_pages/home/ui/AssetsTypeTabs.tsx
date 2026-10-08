'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'

import { assetsFiltersAtom, updateAssetsFiltersAtom } from '../model/assetsFiltersAtoms'
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'

import { RWA_ASSET_TYPES, type RwaAssetType } from '@/entities/asset'

const TAB_TITLES: Record<RwaAssetType, string> = { stock: 'Stocks', index: 'ETFs' }

interface AssetsTypeTabsProps {
  tableId: string
}

export function AssetsTypeTabs({ tableId }: AssetsTypeTabsProps): ReactNode {
  const { type: selectedType } = useAtomValue(assetsFiltersAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const counts = useAtomValue(assetsPageQueryAtom).data?.typeCounts
  const tabs: { type: RwaAssetType | null; title: string; count: number | undefined }[] = [
    {
      type: null,
      title: 'All assets',
      count: counts && RWA_ASSET_TYPES.reduce((acc, type) => acc + counts[type], 0),
    },
    ...RWA_ASSET_TYPES.map((type) => ({ type, title: TAB_TITLES[type], count: counts?.[type] })),
  ]

  return (
    <div className={styles.tabs} role="tablist" aria-label="Asset type">
      {tabs.map(({ type, title, count }) => (
        <button
          key={title}
          type="button"
          role="tab"
          className={styles.tab}
          aria-selected={type === selectedType}
          aria-controls={tableId}
          onClick={() => updateFilters({ type })}
        >
          {title}
          {count !== undefined && <span className={styles.tabCount}>{count}</span>}
        </button>
      ))}
    </div>
  )
}
