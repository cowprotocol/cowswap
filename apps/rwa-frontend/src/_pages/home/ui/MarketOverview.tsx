'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { MarketTotalsCard } from './MarketTotalsCard'
import { MostTradedCard } from './MostTradedCard'
import { TopMoversCard } from './TopMoversCard'

import { marketOverviewQueryAtom } from '../model/marketOverviewQueryAtom'

import { StatusMessage } from '@/shared/ui/status-message'

export function MarketOverview(): ReactNode {
  const { data, error } = useAtomValue(marketOverviewQueryAtom)

  if (error && !data) return <StatusMessage>Failed to load the market overview: {error.message}</StatusMessage>

  const degraded = data?.degraded ?? false

  return (
    <>
      {degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
      <div className={styles.grid}>
        <MarketTotalsCard overview={data} />
        <MostTradedCard items={data?.mostTraded} degraded={degraded} />
        <TopMoversCard gainers={data?.gainers} losers={data?.losers} degraded={degraded} />
      </div>
    </>
  )
}
