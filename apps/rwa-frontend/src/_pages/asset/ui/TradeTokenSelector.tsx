'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useState } from 'react'

import Image from 'next/image'

import { TokenLogo } from './TokenLogo'
import styles from './TradeTokenSelector.module.css'

import { isRankedQuote } from '../lib/quotedTokens'
import { getTokenKey } from '../lib/tokenKey'
import { tradeSideAtom, tradeTokenKeyAtom } from '../model/tradeSelectionAtoms'
import { useSelectTradeNetwork } from '../model/useSelectTradeToken'

import type { QuotedToken } from '../lib/quotedTokens'
import type { TradeSide } from '../lib/tradeLeg'
import type { TradeSelection } from '../model/useTradeSelection'

import { assetQueryAtomFamily, type RwaAsset, type RwaMarketData } from '@/entities/asset'
import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'
import { usePrefersDarkScheme } from '@/shared/lib/theme'

const TRADE_SIDES: { side: TradeSide; title: string }[] = [
  { side: 'buy', title: 'Buy' },
  { side: 'sell', title: 'Sell' },
]

const QUOTE_ERRORS: Record<string, string> = {
  NoLiquidity: 'No liquidity',
  UnsupportedToken: 'Not tradable',
  Unavailable: 'Quote unavailable',
}

interface TradeTokenOptionProps {
  quoted: QuotedToken
  market: RwaMarketData | null | undefined
  isSelected: boolean
  isSelectedByUser: boolean
  isBest: boolean
  isLoading: boolean
  isStatsShown: boolean
  /** Set when other tokens have verified quotes */
  isUnverifiedShown: boolean
  onSelect(): void
}

interface TradeTokenSelectorProps {
  asset: RwaAsset
  selection: TradeSelection
}

export function TradeTokenSelector({ asset, selection }: TradeTokenSelectorProps): ReactNode {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market
  const setSide = useSetAtom(tradeSideAtom)
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)
  const [isStatsShown, setIsStatsShown] = useState(true)
  const { side, quotedTokens, bestToken, assetToken, isAutoSelected } = selection
  const sideTitle = side === 'buy' ? 'Buy' : 'Sell'
  const rankedCount = quotedTokens.filter(isRankedQuote).length
  const hasVerifiedQuote = quotedTokens.some((quoted) => isRankedQuote(quoted) && quoted.quote?.verified)

  return (
    <div className={styles.selector}>
      <div className={styles.controls}>
        <div className={styles.sides} role="group" aria-label="Trade side">
          {TRADE_SIDES.map(({ side: option, title }) => (
            <button key={option} type="button" aria-pressed={option === side} onClick={() => setSide(option)}>
              {title}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.auto}
          disabled={isAutoSelected}
          title="Trade the token with the best quote"
          onClick={() => setTokenKey(null)}
        >
          Use Auto
        </button>
        <NetworkSelect asset={asset} chainId={selection.chainId} />
      </div>
      <div className={styles.tableHeader}>
        <span>
          Stock token{' '}
          <button
            type="button"
            className={styles.statsToggle}
            aria-expanded={isStatsShown}
            onClick={() => setIsStatsShown((shown) => !shown)}
          >
            Stats {isStatsShown ? '▴' : '▾'}
          </button>
        </span>
        <span className={styles.quoteTitle}>
          {sideTitle} quote / share · incl. fees
          <span
            className={styles.info}
            role="img"
            aria-label="Quote details"
            title={`Price per share for a $1,000 ${side} order, including network costs and fees`}
          >
            i
          </span>
        </span>
      </div>
      {selection.quotesError && (
        <p className={styles.notice}>Quotes are unavailable: {selection.quotesError.message}</p>
      )}
      <ul className={styles.tokens} role="radiogroup" aria-label={`${asset.ticker} token`}>
        {quotedTokens.map((quoted) => (
          <li key={getTokenKey(quoted.token)}>
            <TradeTokenOption
              quoted={quoted}
              market={market}
              isSelected={quoted.token === assetToken}
              isSelectedByUser={quoted.token === assetToken && !isAutoSelected}
              isBest={rankedCount > 1 && quoted.token === bestToken}
              isLoading={selection.isQuotesLoading}
              isStatsShown={isStatsShown}
              isUnverifiedShown={hasVerifiedQuote && !quoted.quote?.verified}
              onSelect={() => setTokenKey(getTokenKey(quoted.token))}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function NetworkSelect({ asset, chainId }: { asset: RwaAsset; chainId: number }): ReactNode {
  const prefersDark = usePrefersDarkScheme()
  const selectNetwork = useSelectTradeNetwork()
  const chainIds = [...new Set(asset.tokens.map((token) => token.chainId))]
  const logoUrl = getChainLogoUrl(chainId, prefersDark)

  return (
    <label className={styles.network}>
      {logoUrl && <Image className={styles.networkLogo} src={logoUrl} alt="" width={20} height={20} unoptimized />}
      <span className={styles.visuallyHidden}>Network</span>
      <select value={chainId} onChange={(event) => selectNetwork(Number(event.target.value))}>
        {chainIds.map((id) => (
          <option key={id} value={id}>
            {getChainLabel(id)}
          </option>
        ))}
      </select>
    </label>
  )
}

function TradeTokenOption({
  quoted: { token, quote, pricePerShare, isPriceOutlier, stats },
  market,
  isSelected,
  isSelectedByUser,
  isBest,
  isLoading,
  isStatsShown,
  isUnverifiedShown,
  onSelect,
}: TradeTokenOptionProps): ReactNode {
  const logoUrl = token.coingeckoId ? market?.tokens[token.coingeckoId]?.logoUrl : undefined
  const stockPrice = market?.price

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={isSelected ? `${styles.option} ${styles.selected}` : styles.option}
      onClick={onSelect}
    >
      <span className={styles.optionMain}>
        <TokenLogo symbol={token.symbol} logoUrl={logoUrl} chainId={token.chainId} size="large" />
        <span className={styles.optionTitle}>
          <span>
            <strong>{token.symbol}</strong> · {token.issuer}
          </span>
          {isBest && <span className={styles.bestBadge}>Best quote</span>}
          {isSelectedByUser && !isBest && <span className={styles.secondary}>Selected by you</span>}
        </span>
        <span className={styles.quote}>
          {isPriceOutlier ? (
            <span className={styles.secondary} title="The quote is far from the stock price, liquidity is too low">
              Insufficient liquidity
            </span>
          ) : pricePerShare !== null ? (
            <>
              <span className={styles.price}>≈ {formatUsd(pricePerShare)}</span>
              {isUnverifiedShown && (
                <span className={styles.secondary} title="The order book could not simulate this trade">
                  Unverified quote
                </span>
              )}
              {stockPrice && (
                <span className={styles.premium}>
                  {formatPercent((pricePerShare / stockPrice - 1) * 100)} vs stock price
                </span>
              )}
            </>
          ) : (
            <span className={styles.secondary}>
              {isLoading ? 'Loading quote…' : (QUOTE_ERRORS[quote?.error ?? ''] ?? 'No quote')}
            </span>
          )}
        </span>
      </span>
      {isStatsShown && (
        <span className={styles.stats}>
          <span>
            Onchain cap <strong>{formatCompactUsd(stats?.onchainCap)}</strong>
          </span>
          <span>
            24h DEX vol <strong>{formatCompactUsd(stats?.dexVolume24h)}</strong>
          </span>
        </span>
      )}
    </button>
  )
}
