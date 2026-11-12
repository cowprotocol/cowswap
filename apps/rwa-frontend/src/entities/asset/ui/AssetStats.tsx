import type { ReactNode } from 'react'

import styles from './AssetStats.module.css'

import { getMinutesToUsMarketChange, isUsMarketOpen, US_MARKET_EARLY_CLOSE } from '../lib/usMarketStatus'

import type { RwaAsset, RwaMarketData, RwaMarketKind, RwaTradingTime } from '../model/types'

import { formatDuration, formatPercent, formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { Tooltip } from '@/shared/ui/tooltip'

interface AssetStatsProps {
  asset: RwaAsset
  market: Pick<RwaMarketData, 'price' | 'change24h'> | null | undefined
  marketKind: RwaMarketKind
  /** Where `market` comes from, e.g. `Ondo`. `null` while unknown */
  provider: string | null
}

export function AssetStats({ asset, market, marketKind, provider }: AssetStatsProps): ReactNode {
  const change = market?.change24h
  const changeClassName = change ? (change > 0 ? styles.positive : styles.negative) : ''

  return (
    <div className={styles.stats}>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatUsd(market?.price)}</span>
        <span className={styles.change}>
          <span className={changeClassName}>{formatPercent(change)}</span>
          <span className={styles.period}>24h</span>
          <Tooltip className={styles.reference} content={getPriceHint(asset, marketKind, provider)}>
            · {marketKind === 'stock' ? 'Stock price' : 'Reference price'}
            <InfoIcon />
          </Tooltip>
        </span>
      </div>
      {/* Rendered once market data loads, so a prerendered page doesn't hydrate with the build time status */}
      {market && asset.allowedTradingTime && <MarketStatus tradingTime={asset.allowedTradingTime} />}
    </div>
  )
}

function getPriceHint({ title }: RwaAsset, marketKind: RwaMarketKind, provider: string | null): string {
  const disclaimer = 'Past performance is not indicative of future results.'

  if (marketKind === 'tokenized') {
    return `The price and chart show the tokenized market of ${title} per share, from CoinGecko, across issuers and networks. Token prices and liquidity may differ. ${disclaimer}`
  }

  const source = provider ? `, from ${provider}` : ''

  return `The price and chart show the ${title} share on its exchange${source}, including extended-hours sessions. Token prices may differ from the stock price. ${disclaimer}`
}

function getTimeZoneCity(timeZone: string): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ')
}

function MarketStatus({ tradingTime }: { tradingTime: RwaTradingTime }): ReactNode {
  const now = new Date()
  const open = isUsMarketOpen(tradingTime, now)
  const minutesToChange = getMinutesToUsMarketChange(tradingTime, now)

  return (
    <Tooltip
      className={styles.status}
      content={
        <>
          US regular session:
          <ul className={styles.sessionList}>
            <li>
              {tradingTime.start} – {tradingTime.end} {getTimeZoneCity(tradingTime.timeZone)} time, Mon–Fri, except US
              market holidays
            </li>
            <li>
              {tradingTime.start} – {US_MARKET_EARLY_CLOSE} on early-close days
            </li>
          </ul>
        </>
      }
    >
      <span className={open ? styles.statusOpen : styles.statusClosed}>US market {open ? 'open' : 'closed'}</span>
      {minutesToChange !== null && (
        <span>
          · {open ? 'closes' : 'opens'} in {formatDuration(minutesToChange)}
        </span>
      )}
      <InfoIcon />
    </Tooltip>
  )
}
