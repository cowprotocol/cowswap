'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './ChartRangeSelector.module.css'

import { isStockUnavailableAtomFamily, marketKindAtom, shownMarketKindAtomFamily } from '../model/marketKindAtom'

import { RWA_MARKET_KINDS, type RwaAsset, type RwaMarketKind } from '@/entities/asset'

const MARKET_KIND_LABELS: Record<RwaMarketKind, string> = { stock: 'Stock', tokenized: 'Tokenized stock' }

interface MarketKindSelectorProps {
  asset: RwaAsset
  className?: string
}

/** Every instance shows and sets the same market */
export function MarketKindSelector({ asset, className }: MarketKindSelectorProps): ReactNode {
  const shownKind = useAtomValue(shownMarketKindAtomFamily(asset.ticker))
  const isStockUnavailable = useAtomValue(isStockUnavailableAtomFamily(asset.ticker))
  const setMarketKind = useSetAtom(marketKindAtom)

  return (
    <div className={className ? `${styles.ranges} ${className}` : styles.ranges} role="group" aria-label="Market">
      {RWA_MARKET_KINDS.map((kind) => {
        const isDisabled = kind === 'stock' && isStockUnavailable

        return (
          <button
            key={kind}
            type="button"
            className={kind === shownKind ? styles.activeRange : undefined}
            aria-pressed={kind === shownKind}
            disabled={isDisabled}
            title={isDisabled ? `Stock market data isn't available for ${asset.title}` : undefined}
            onClick={() => setMarketKind(kind)}
          >
            {MARKET_KIND_LABELS[kind]}
          </button>
        )
      })}
    </div>
  )
}
