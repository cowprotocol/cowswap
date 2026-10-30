import type { ReactNode } from 'react'

import styles from './TradeTokenParts.module.css'

import { getPremiumNote } from '../lib/premiumNote'
import { isRankedQuote, type QuotedToken } from '../lib/quotedTokens'

import type { RwaMarketData } from '@/entities/asset'

import { formatPercent, formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

const QUOTE_ERRORS: Record<string, string> = {
  NoLiquidity: 'No liquidity',
  UnsupportedToken: 'Not tradable',
  Unavailable: 'Quote unavailable',
}

interface TradeTokenNameProps {
  quoted: QuotedToken
  /** Shown as a badge when set */
  bestQuoteLabel: string | null
}

interface TradeTokenQuoteProps {
  quoted: QuotedToken
  stockPrice: number | null | undefined
  isLoading: boolean
}

/** Not selectable: its quotes loaded without a price to trade at */
export function isQuoteUnavailable(quoted: QuotedToken, isLoading: boolean): boolean {
  return !isLoading && !isRankedQuote(quoted)
}

/** Has a quote the order book could not simulate */
export function isUnverifiedQuote(quoted: QuotedToken): boolean {
  return isRankedQuote(quoted) && !quoted.quote?.verified
}

export function TradeTokenLogo({
  quoted: { token },
  market,
}: {
  quoted: QuotedToken
  market: RwaMarketData | null | undefined
}): ReactNode {
  const logoUrl = token.coingeckoId ? market?.tokens[token.coingeckoId]?.logoUrl : undefined

  return <TokenLogo symbol={token.symbol} logoUrl={logoUrl} chainId={token.chainId} />
}

export function TradeTokenName({ quoted, bestQuoteLabel }: TradeTokenNameProps): ReactNode {
  const { token } = quoted

  return (
    <span className={styles.name}>
      <span className={styles.symbol}>
        {token.symbol} · {token.issuer}
      </span>
      {bestQuoteLabel && <span className={`${styles.tag} ${styles.bestTag}`}>{bestQuoteLabel}</span>}
      {isUnverifiedQuote(quoted) && (
        <>
          <span className={styles.tag}>Unverified</span>
          <Tooltip className={styles.info} content="The order book could not simulate this trade">
            <span role="img" aria-label="Unverified quote details">
              <InfoIcon />
            </span>
          </Tooltip>
        </>
      )}
    </span>
  )
}

export function TradeTokenQuote({ quoted, stockPrice, isLoading }: TradeTokenQuoteProps): ReactNode {
  const { token, quote, pricePerShare, sharesPerToken, isPriceOutlier } = quoted

  if (isPriceOutlier) {
    return (
      <span className={styles.quote}>
        <Tooltip className={styles.status} content="The quote is far from the stock price, liquidity is too low">
          No liquidity
        </Tooltip>
      </span>
    )
  }

  if (pricePerShare === null) {
    return (
      <span className={styles.quote}>
        <span className={styles.status}>
          {isLoading ? 'Loading quote…' : (QUOTE_ERRORS[quote?.error ?? ''] ?? 'No quote')}
        </span>
      </span>
    )
  }

  const premium = stockPrice ? pricePerShare / stockPrice - 1 : null

  return (
    <span className={styles.quote}>
      <span className={styles.price}>≈ {formatUsd(pricePerShare)}</span>
      {premium !== null && (
        <Tooltip className={styles.premium} content={getPremiumNote(token, sharesPerToken, premium)}>
          {formatPercent(premium * 100)} vs stock
        </Tooltip>
      )}
    </span>
  )
}
