'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useEffect, useRef } from 'react'

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

/** The rail's inline padding at phone widths */
const RAIL_GUTTER = 16

interface AssetsTypeTabsProps {
  tableId: string
}

export function AssetsTypeTabs({ tableId }: AssetsTypeTabsProps): ReactNode {
  const { type: selectedType } = useAtomValue(assetsFiltersAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rail = railRef.current
    const selected = rail?.querySelector<HTMLElement>('[aria-pressed="true"]')

    if (rail && selected) revealInRail(rail, selected)
  }, [selectedType])

  return (
    <div
      ref={railRef}
      className={styles.types}
      role="group"
      aria-label="Asset type"
      onFocus={(event) => revealInRail(event.currentTarget, event.target)}
    >
      <button
        type="button"
        className={styles.outlinedButton}
        aria-pressed={selectedType === null}
        aria-controls={tableId}
        onClick={() => updateFilters({ type: null })}
      >
        All
      </button>
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

/** Scrolls only the rail: `scrollIntoView` would also scroll the page to the toolbar, which starts below the fold */
function revealInRail(rail: HTMLElement, pill: HTMLElement): void {
  if (rail.scrollWidth <= rail.clientWidth) return

  const railRect = rail.getBoundingClientRect()
  const pillRect = pill.getBoundingClientRect()
  const pastEnd = pillRect.right + RAIL_GUTTER - railRect.right
  const pastStart = railRect.left + RAIL_GUTTER - pillRect.left

  if (pastEnd > 0) rail.scrollBy({ left: pastEnd })
  else if (pastStart > 0) rail.scrollBy({ left: -pastStart })
}
