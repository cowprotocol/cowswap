'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './TradeTokenSelector.module.css'

import { isRankedQuote } from '../lib/quotedTokens'
import { tradeSideAtom, tradeTokenKeyAtom } from '../model/tradeSelectionAtoms'
import { useSelectTradeNetwork } from '../model/useSelectTradeToken'

import type { QuotedToken } from '../lib/quotedTokens'
import type { TradeSelection } from '../model/useTradeSelection'

import {
  assetQueryAtomFamily,
  getTokenKey,
  type RwaAsset,
  type RwaMarketData,
  type RwaQuoteSide,
} from '@/entities/asset'
import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'
import { useIsDarkTheme } from '@/shared/lib/theme'
import { InfoIcon } from '@/shared/ui/icons'
import { Select } from '@/shared/ui/select'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

const TRADE_SIDES: { side: RwaQuoteSide; title: string }[] = [
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
        {!isAutoSelected && (
          <Tooltip content="Trade the token with the best quote">
            <button type="button" className={styles.auto} onClick={() => setTokenKey(null)}>
              Use Auto
            </button>
          </Tooltip>
        )}
        <NetworkSelect asset={asset} chainId={selection.chainId} />
      </div>
      <div className={styles.tableHeader}>
        <span>Stock token</span>
        <span className={styles.quoteTitle}>
          {sideTitle} quote / share
          <Tooltip content={`Price per share for a $1,000 ${side} order, including network costs and fees`}>
            <span className={styles.info} role="img" aria-label="Quote details">
              <InfoIcon />
            </span>
          </Tooltip>
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
  const isDark = useIsDarkTheme()
  const selectNetwork = useSelectTradeNetwork()
  const chainIds = [...new Set(asset.tokens.map((token) => token.chainId))]

  return (
    <Select
      variant="filled"
      aria-label="Network"
      value={chainId}
      options={chainIds.map((id) => {
        const logoUrl = getChainLogoUrl(id, isDark)

        return {
          value: id,
          label: getChainLabel(id),
          icon: logoUrl && (
            <Image className={styles.networkLogo} src={logoUrl} alt="" width={20} height={20} unoptimized />
          ),
        }
      })}
      onChange={selectNetwork}
    />
  )
}

function TradeTokenOption({
  quoted: { token, quote, pricePerShare, isPriceOutlier, stats },
  market,
  isSelected,
  isSelectedByUser,
  isBest,
  isLoading,
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
      <TokenLogo symbol={token.symbol} logoUrl={logoUrl} chainId={token.chainId} />
      <span className={styles.optionTitle}>
        <span className={styles.optionName}>
          <span>
            {token.symbol} · {token.issuer}
          </span>
          {isBest && <span className={styles.bestBadge}>Best quote</span>}
          {isSelectedByUser && !isBest && <span className={styles.secondary}>Selected by you</span>}
        </span>
        <span className={styles.stats}>
          <span>
            Onchain cap <strong>{formatCompactUsd(stats?.onchainCap)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            24h vol <strong>{formatCompactUsd(stats?.dexVolume24h)}</strong>
          </span>
        </span>
      </span>
      <span className={styles.quote}>
        {isPriceOutlier ? (
          <Tooltip content="The quote is far from the stock price, liquidity is too low">
            <span className={styles.secondary}>Insufficient liquidity</span>
          </Tooltip>
        ) : pricePerShare !== null ? (
          <>
            <span className={styles.price}>≈ {formatUsd(pricePerShare)}</span>
            {isUnverifiedShown && (
              <Tooltip content="The order book could not simulate this trade">
                <span className={styles.secondary}>Unverified quote</span>
              </Tooltip>
            )}
            {stockPrice && (
              <span className={styles.secondary}>{formatPercent((pricePerShare / stockPrice - 1) * 100)} vs stock</span>
            )}
          </>
        ) : (
          <span className={styles.secondary}>
            {isLoading ? 'Loading quote…' : (QUOTE_ERRORS[quote?.error ?? ''] ?? 'No quote')}
          </span>
        )}
      </span>
    </button>
  )
}
