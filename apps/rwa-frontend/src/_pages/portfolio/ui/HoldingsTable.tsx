'use client'

import { type ReactNode, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import styles from './Portfolio.module.css'

import type { Holding, TokenHolding } from '../lib/holdings'
import type { Portfolio } from '../model/usePortfolio'

import { DividendNotes, getTokenKey, RWA_ASSET_TYPE_LABELS } from '@/entities/asset'
import { getChainLabel, getExplorerAddressUrl } from '@/shared/lib/chain'
import { EMPTY_VALUE, formatUsd, toTokenUnits } from '@/shared/lib/format'
import { ChevronDownIcon } from '@/shared/ui/icons'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'
import { RowMenu } from '@/widgets/account'

const sharesFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const tokenAmountFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })

interface HoldingRowsProps {
  holding: Holding
  getLogoUrl: Portfolio['getLogoUrl']
}

interface HoldingsTableProps {
  holdings: Holding[]
  getLogoUrl: Portfolio['getLogoUrl']
  /** The wallet holds no stock tokens, as opposed to none matching the filters */
  isWalletEmpty: boolean
}

interface TokenRowProps {
  holding: Holding
  tokenHolding: TokenHolding
  getLogoUrl: Portfolio['getLogoUrl']
  className: string
}

export function HoldingsTable({ holdings, getLogoUrl, isWalletEmpty }: HoldingsTableProps): ReactNode {
  const isEmpty = !holdings.length

  return (
    <>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.assetColumn}>Asset / stock token</th>
              <th className={styles.numeric}>You hold</th>
              {isEmpty ? (
                <th className={styles.numeric}>Underlying value</th>
              ) : (
                <th className={`${styles.numeric} ${styles.sorted}`} aria-sort="descending">
                  <span aria-hidden="true">↓</span> Underlying value
                </th>
              )}
              <th className={styles.menuColumn}>
                <span className={styles.visuallyHidden}>Actions</span>
              </th>
            </tr>
          </thead>
          {holdings.map((holding) => (
            <HoldingRows key={holding.asset.ticker} holding={holding} getLogoUrl={getLogoUrl} />
          ))}
        </table>
      </div>
      {isEmpty ? (
        isWalletEmpty ? (
          <EmptyWallet />
        ) : (
          <StatusMessage>No positions match the filters</StatusMessage>
        )
      ) : (
        <DividendNotes
          className={styles.dividendNotes}
          tokens={holdings.flatMap(({ tokens }) => tokens.map(({ token }) => token))}
        />
      )}
    </>
  )
}

function EmptyWallet(): ReactNode {
  return (
    <section className={styles.emptyWallet} aria-labelledby="portfolio-empty-title">
      <h2 id="portfolio-empty-title">No stock tokens in this wallet yet</h2>
      <p>Stock tokens you buy, from any issuer and network, show here with your open orders and activity.</p>
      <Link className={styles.exploreLink} href="/">
        Explore assets
      </Link>
    </section>
  )
}

function formatShares(shares: number): string {
  return `${sharesFormatter.format(shares)} equivalent ${shares === 1 ? 'share' : 'shares'}`
}

function formatValue(value: number | null): string {
  return value === null ? EMPTY_VALUE : `≈ ${formatUsd(value)}`
}

function getWellClassName(index: number, count: number): string {
  return [styles.tokenRow, index === 0 && styles.firstTokenRow, index === count - 1 && styles.lastTokenRow]
    .filter(Boolean)
    .join(' ')
}

function HoldingRows({ holding, getLogoUrl }: HoldingRowsProps): ReactNode {
  const { asset, tokens, shares, value } = holding
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(tokens.length > 1)
  const tokensLabel = `${tokens.length} stock token${tokens.length === 1 ? '' : 's'}`

  return (
    <tbody className={styles.group}>
      <tr className={styles.assetRow}>
        <td>
          <div className={styles.holding}>
            <button
              type="button"
              className={styles.expandButton}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Hide' : 'Show'} ${asset.title} stock tokens`}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              <ChevronDownIcon />
            </button>
            <TokenLogo symbol={asset.ticker} logoUrl={getLogoUrl(asset)} />
            <div className={styles.holdingIdentity}>
              <Link className={styles.holdingTitle} href={`/asset/${asset.ticker}`}>
                {asset.title}
              </Link>
              <span className={styles.secondary}>
                {asset.ticker} · {RWA_ASSET_TYPE_LABELS[asset.type]} · {tokensLabel}
              </span>
            </div>
          </div>
        </td>
        <td className={`${styles.numeric} ${styles.strong}`}>{formatShares(shares)}</td>
        <td className={`${styles.numeric} ${styles.strong}`}>{formatValue(value)}</td>
        <td className={styles.menuColumn}>
          <RowMenu
            label={`${asset.title} actions`}
            items={[{ label: `Open ${asset.title}`, onSelect: () => router.push(`/asset/${asset.ticker}`) }]}
          />
        </td>
      </tr>
      {isExpanded &&
        tokens.map((tokenHolding, index) => (
          <TokenRow
            key={getTokenKey(tokenHolding.token)}
            holding={holding}
            tokenHolding={tokenHolding}
            getLogoUrl={getLogoUrl}
            className={getWellClassName(index, tokens.length)}
          />
        ))}
    </tbody>
  )
}

function TokenRow({ holding: { asset }, tokenHolding, getLogoUrl, className }: TokenRowProps): ReactNode {
  const { token, balance, shares, value } = tokenHolding
  const router = useRouter()
  const explorerUrl = getExplorerAddressUrl(token.chainId, token.address)
  const amount =
    token.decimals === null ? EMPTY_VALUE : tokenAmountFormatter.format(toTokenUnits(balance, token.decimals))

  return (
    <tr className={className}>
      <td>
        <div className={styles.holding}>
          <TokenLogo symbol={token.symbol} logoUrl={getLogoUrl(asset, token)} chainId={token.chainId} />
          <div className={styles.holdingIdentity}>
            <span className={styles.tokenTitle}>
              {token.symbol} · {token.issuer}
            </span>
            <span className={styles.secondary}>{getChainLabel(token.chainId)}</span>
          </div>
        </div>
      </td>
      <td className={styles.numeric}>
        {amount} {token.symbol}
        <span className={`${styles.secondary} ${styles.block}`}>{formatShares(shares)}</span>
      </td>
      <td className={styles.numeric}>{formatValue(value)}</td>
      <td className={styles.menuColumn}>
        <RowMenu
          label={`${token.symbol} on ${getChainLabel(token.chainId)} actions`}
          items={[
            { label: `Open ${asset.title}`, onSelect: () => router.push(`/asset/${asset.ticker}`) },
            ...(explorerUrl
              ? [
                  {
                    label: 'View token on explorer',
                    onSelect: () => window.open(explorerUrl, '_blank', 'noopener,noreferrer'),
                  },
                ]
              : []),
          ]}
        />
      </td>
    </tr>
  )
}
