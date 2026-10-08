'use client'

import { type ReactNode, useState } from 'react'

import Link from 'next/link'

import styles from './Portfolio.module.css'

import type { Holding } from '../lib/holdings'
import type { Portfolio } from '../model/usePortfolio'

import { getTokenKey } from '@/entities/asset'
import { getChainLabel } from '@/shared/lib/chain'
import { formatTokenAmount, formatUsd } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

const sharesFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

const ASSET_TYPE_LABELS = { stock: 'Stock', index: 'Index fund' } as const

interface HoldingRowsProps {
  holding: Holding
  getLogoUrl: Portfolio['getLogoUrl']
}

interface HoldingsTableProps {
  holdings: Holding[]
  getLogoUrl: Portfolio['getLogoUrl']
}

export function HoldingsTable({ holdings, getLogoUrl }: HoldingsTableProps): ReactNode {
  if (!holdings.length) return <StatusMessage>No holdings match the filters</StatusMessage>

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Asset</th>
            <th className={styles.numeric}>Equivalent shares</th>
            <th className={styles.numeric}>Underlying value</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <HoldingRows key={holding.asset.ticker} holding={holding} getLogoUrl={getLogoUrl} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HoldingRows({ holding: { asset, tokens, shares, value }, getLogoUrl }: HoldingRowsProps): ReactNode {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <tr>
        <td>
          <div className={styles.holding}>
            <TokenLogo symbol={asset.ticker} logoUrl={getLogoUrl(asset)} size="large" />
            <div className={styles.holdingIdentity}>
              <Link className={styles.holdingTitle} href={`/asset/${asset.ticker}`}>
                {asset.title}
              </Link>
              <span className={styles.secondary}>
                {asset.ticker} · {ASSET_TYPE_LABELS[asset.type]}
              </span>
              <button
                type="button"
                className={styles.tokensToggle}
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((expanded) => !expanded)}
              >
                {tokens.length} stock token{tokens.length === 1 ? '' : 's'} {isExpanded ? '▴' : '▾'}
              </button>
            </div>
          </div>
        </td>
        <td className={styles.numeric}>{sharesFormatter.format(shares)}</td>
        <td className={`${styles.numeric} ${styles.value}`}>{formatUsd(value)}</td>
      </tr>
      {isExpanded &&
        tokens.map(({ token, balance, value: tokenValue }) => (
          <tr key={getTokenKey(token)} className={styles.tokenRow}>
            <td>
              <div className={styles.holding}>
                <TokenLogo symbol={token.symbol} logoUrl={getLogoUrl(asset, token)} chainId={token.chainId} />
                <div className={styles.holdingIdentity}>
                  {token.symbol}
                  <span className={styles.secondary}>
                    {token.issuer} · {getChainLabel(token.chainId)}
                  </span>
                </div>
              </div>
            </td>
            <td className={styles.numeric}>{formatTokenAmount(balance, token.decimals)}</td>
            <td className={styles.numeric}>{formatUsd(tokenValue)}</td>
          </tr>
        ))}
    </>
  )
}
