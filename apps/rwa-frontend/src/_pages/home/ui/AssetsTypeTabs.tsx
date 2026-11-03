'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { CommoditiesIcon, EtfsIcon, StocksIcon } from './ToolbarIcons'

import { assetsFiltersAtom, updateAssetsFiltersAtom } from '../model/assetsFiltersAtoms'

import { RWA_ASSET_TYPES, type RwaAssetType } from '@/entities/asset'

const TYPE_TITLES: Record<RwaAssetType, string> = { stock: 'Stocks', index: 'ETFs', commodity: 'Commodities' }

const TYPE_ICONS: Record<RwaAssetType, () => ReactNode> = {
  stock: StocksIcon,
  index: EtfsIcon,
  commodity: CommoditiesIcon,
}

interface AssetsTypeTabsProps {
  tableId: string
}

export function AssetsTypeTabs({ tableId }: AssetsTypeTabsProps): ReactNode {
  const { type: selectedType } = useAtomValue(assetsFiltersAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)

  return (
    <div className={styles.types} role="group" aria-label="Asset type">
      {RWA_ASSET_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type]
        const isSelected = type === selectedType

        return (
          <button
            key={type}
            type="button"
            className={styles.outlinedButton}
            aria-pressed={isSelected}
            aria-controls={tableId}
            onClick={() => updateFilters({ type: isSelected ? null : type })}
          >
            <Icon />
            {TYPE_TITLES[type]}
          </button>
        )
      })}
    </div>
  )
}
