'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useId } from 'react'

import styles from './ChartRangeSelector.module.css'

import {
  isStockOutageAtomFamily,
  isStockUnavailableAtomFamily,
  marketKindAtom,
  shownMarketKindAtomFamily,
} from '../model/marketKindAtom'

import { RWA_MARKET_KINDS, type RwaAsset, type RwaMarketKind } from '@/entities/asset'
import { trackEvent } from '@/shared/lib/analytics'

const MARKET_KIND_LABELS: Record<RwaMarketKind, string> = { stock: 'Stock', tokenized: 'Tokenized stock' }

interface MarketKindSelectorProps {
  asset: RwaAsset
  className?: string
}

/** Every instance shows and sets the same market */
export function MarketKindSelector({ asset, className }: MarketKindSelectorProps): ReactNode {
  const shownKind = useAtomValue(shownMarketKindAtomFamily(asset.ticker))
  const isStockUnavailable = useAtomValue(isStockUnavailableAtomFamily(asset.ticker))
  const isStockOutage = useAtomValue(isStockOutageAtomFamily(asset.ticker))
  const setMarketKind = useSetAtom(marketKindAtom)
  const hintId = useId()
  const unavailableHint = isStockOutage
    ? `Stock market data is temporarily unavailable for ${asset.title}`
    : `Stock market data isn't available for ${asset.title}`

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
            aria-disabled={isDisabled}
            aria-describedby={isDisabled ? hintId : undefined}
            title={isDisabled ? unavailableHint : undefined}
            onClick={
              isDisabled
                ? undefined
                : () => {
                    setMarketKind(kind)
                    trackEvent('market_kind_select', { ticker: asset.ticker, marketKind: kind })
                  }
            }
          >
            {MARKET_KIND_LABELS[kind]}
          </button>
        )
      })}
      {isStockUnavailable && (
        <span id={hintId} className={styles.hint}>
          {unavailableHint}
        </span>
      )}
    </div>
  )
}
