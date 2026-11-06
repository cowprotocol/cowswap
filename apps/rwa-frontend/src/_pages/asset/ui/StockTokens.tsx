'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useId, useMemo, useState } from 'react'

import tableStyles from './AccountTable.module.css'
import styles from './StockTokens.module.css'

import { getPremiumNote } from '../lib/premiumNote'
import { getTokenPriceSharesPerToken } from '../lib/tokenPriceShares'
import { formatTokenStat } from '../lib/tokenStat'
import { tokenStatsQueryAtomFamily } from '../model/tradeQueryAtoms'
import { useSelectTradeToken } from '../model/useSelectTradeToken'
import { useTradeSelection } from '../model/useTradeSelection'

import {
  assetQueryAtomFamily,
  DividendNotes,
  getIssuerLegalDocsUrl,
  getTokenKey,
  type RwaAsset,
  type RwaQuoteSide,
  type RwaToken,
  type RwaTokenMarketData,
  type RwaTokenNetworkStats,
} from '@/entities/asset'
import { getChainLabel, getExplorerAddressUrl } from '@/shared/lib/chain'
import { formatPercent, formatUsd, shortenAddress } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { useNetworkOptions } from '@/shared/ui/network-logos'
import { Select } from '@/shared/ui/select'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

const TOKEN_METRICS_HINT =
  'Per token and network, from CoinGecko. Onchain market cap is the token supply on the network times the token price. 24h DEX volume is the DEX trading of the token on the network over the last 24 hours.'

interface DividendNotesToggleProps {
  isExpanded: boolean
  /** Id of the notes panel */
  controls: string
  onToggle(): void
}

interface StockTokenRowProps {
  token: RwaToken
  market: RwaTokenMarketData | undefined
  stats: RwaTokenNetworkStats | undefined
  /** `getTokenPriceSharesPerToken` of the token, `null` keeps its price per token */
  sharesPerToken: number | null
  stockPrice: number | null | undefined
  isSelected: boolean
  onTrade(side: RwaQuoteSide): void
}

interface VsStockProps {
  token: RwaToken
  sharesPerToken: number | null
  premium: number
}

export function StockTokens({ asset }: { asset: RwaAsset }): ReactNode {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market
  const selectedToken = useTradeSelection(asset)?.assetToken
  const selectTradeToken = useSelectTradeToken()
  const [issuer, setIssuer] = useState<string | null>(null)
  const [network, setNetwork] = useState<number | null>(null)
  const [areDividendNotesShown, setAreDividendNotesShown] = useState(false)
  const dividendNotesId = useId()

  const issuers = useMemo(() => [...new Set(asset.tokens.map((token) => token.issuer))], [asset.tokens])
  const chainIds = useMemo(() => [...new Set(asset.tokens.map((token) => token.chainId))], [asset.tokens])
  const networkOptions = useNetworkOptions(chainIds)
  const priceSharesPerToken = useMemo(
    () => getTokenPriceSharesPerToken(asset.tokens, market?.sharesPerToken ?? {}),
    [asset.tokens, market?.sharesPerToken],
  )
  const statsByKey = useTokenStatsByKey(asset.ticker)
  const tokens = asset.tokens
    .filter((token) => (issuer === null || token.issuer === issuer) && (network === null || token.chainId === network))
    .sort((a, b) => compareOnchainCaps(statsByKey.get(getTokenKey(a)), statsByKey.get(getTokenKey(b))))

  return (
    <section className={styles.section} aria-labelledby="stock-tokens-title">
      <div className={styles.header}>
        <div className={styles.title}>
          <h2 id="stock-tokens-title">Stock tokens</h2>
          <span>
            {asset.tokens.length} {asset.tokens.length === 1 ? 'listing' : 'listings'}
          </span>
        </div>
        <div className={styles.filters}>
          <div className={styles.issuerFilter}>
            <Select
              variant="small"
              aria-label="Issuer"
              value={issuer}
              options={[
                { value: null, label: 'All issuers' },
                ...issuers.map((option) => ({ value: option, label: option })),
              ]}
              onChange={setIssuer}
            />
            <DividendNotesToggle
              isExpanded={areDividendNotesShown}
              controls={dividendNotesId}
              onToggle={() => setAreDividendNotesShown((shown) => !shown)}
            />
          </div>
          <Select
            variant="small"
            aria-label="Network"
            value={network}
            options={[{ value: null, label: 'All networks' }, ...networkOptions]}
            onChange={setNetwork}
          />
        </div>
      </div>
      {areDividendNotesShown && (
        <DividendNotes id={dividendNotesId} className={styles.dividendNotes} tokens={asset.tokens} />
      )}
      {tokens.length ? (
        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Stock token / issuer</th>
                <th className={tableStyles.numeric}>Token price / share</th>
                <th className={tableStyles.numeric}>24h DEX volume</th>
                <th className={`${tableStyles.numeric} ${tableStyles.sorted}`} aria-sort="descending">
                  <span aria-hidden="true">↓</span> Onchain market cap
                </th>
                <th>
                  <span className={styles.visuallyHidden}>Trade</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <StockTokenRow
                  key={getTokenKey(token)}
                  token={token}
                  market={token.coingeckoId ? market?.tokens[token.coingeckoId] : undefined}
                  stats={statsByKey.get(getTokenKey(token))}
                  sharesPerToken={priceSharesPerToken[getTokenKey(token)] ?? null}
                  stockPrice={market?.price}
                  isSelected={token === selectedToken}
                  onTrade={(side) => selectTradeToken(token, side)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <StatusMessage>No {asset.ticker} tokens match the filters</StatusMessage>
      )}
      <TokenLinks issuers={issuers} />
    </section>
  )
}

/** Highest first, unknown caps last */
function compareOnchainCaps(a: RwaTokenNetworkStats | undefined, b: RwaTokenNetworkStats | undefined): number {
  return (b?.onchainCap ?? -1) - (a?.onchainCap ?? -1)
}

function DividendNotesToggle({ isExpanded, controls, onToggle }: DividendNotesToggleProps): ReactNode {
  return (
    <button
      type="button"
      className={styles.infoButton}
      aria-label="How issuers pass on dividends"
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onToggle}
    >
      <InfoIcon />
    </button>
  )
}

function IssuerLegalDocs({ issuers }: { issuers: string[] }): ReactNode {
  const links = issuers.flatMap((issuer) => {
    const url = getIssuerLegalDocsUrl(issuer)

    return url ? [{ issuer, url }] : []
  })

  if (!links.length) return null

  return (
    <p className={styles.legalDocs}>
      <span className={styles.legalDocsTitle}>Issuer legal docs</span>
      {links.map(({ issuer, url }) => (
        <a key={issuer} href={url} target="_blank" rel="noopener noreferrer">
          {issuer} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </p>
  )
}

function StockTokenRow({
  token,
  market,
  stats,
  sharesPerToken,
  stockPrice,
  isSelected,
  onTrade,
}: StockTokenRowProps): ReactNode {
  const network = getChainLabel(token.chainId)
  const explorerUrl = getExplorerAddressUrl(token.chainId, token.address)
  const legalDocsUrl = getIssuerLegalDocsUrl(token.issuer)
  const price = typeof market?.price === 'number' ? market.price / (sharesPerToken ?? 1) : market?.price

  return (
    <tr className={isSelected ? styles.selected : undefined} aria-current={isSelected || undefined}>
      <td>
        <div className={styles.token}>
          <TokenLogo symbol={token.symbol} logoUrl={market?.logoUrl} chainId={token.chainId} />
          <div className={styles.tokenText}>
            <span className={styles.tokenTitle}>
              <span className={styles.symbol}>{token.symbol}</span>
              <span className={styles.issuer}>
                {' · '}
                {legalDocsUrl ? (
                  <a href={legalDocsUrl} target="_blank" rel="noopener noreferrer">
                    {token.issuer} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  token.issuer
                )}
              </span>
            </span>
            <span className={styles.address}>
              {network} ·{' '}
              {explorerUrl ? (
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  {shortenAddress(token.address)} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                shortenAddress(token.address)
              )}
            </span>
          </div>
        </div>
      </td>
      <td className={tableStyles.numeric}>
        {typeof price === 'number' ? `≈ ${formatUsd(price)}` : formatUsd(price)}
        {typeof price === 'number' && stockPrice ? (
          <VsStock token={token} sharesPerToken={sharesPerToken} premium={price / stockPrice - 1} />
        ) : null}
      </td>
      <td className={tableStyles.numeric}>{formatTokenStat(stats?.dexVolume24h)}</td>
      <td className={tableStyles.numeric}>{formatTokenStat(stats?.onchainCap)}</td>
      <td>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buy}
            aria-label={`Buy ${token.symbol} on ${network}`}
            onClick={() => onTrade('buy')}
          >
            Buy
          </button>
          <button
            type="button"
            className={styles.sell}
            aria-label={`Sell ${token.symbol} on ${network}`}
            onClick={() => onTrade('sell')}
          >
            Sell
          </button>
        </div>
      </td>
    </tr>
  )
}

function TokenLinks({ issuers }: { issuers: string[] }): ReactNode {
  return (
    <div className={styles.links}>
      <IssuerLegalDocs issuers={issuers} />
      <Tooltip className={styles.aboutMetrics} content={TOKEN_METRICS_HINT}>
        About token metrics
        <InfoIcon />
      </Tooltip>
    </div>
  )
}

function useTokenStatsByKey(ticker: string): Map<string, RwaTokenNetworkStats> {
  const tokenStats = useAtomValue(tokenStatsQueryAtomFamily(ticker)).data

  return useMemo(() => new Map(tokenStats?.tokens.map((stats) => [getTokenKey(stats), stats])), [tokenStats])
}

function VsStock({ token, sharesPerToken, premium }: VsStockProps): ReactNode {
  return (
    <Tooltip
      className={`${tableStyles.secondary} ${tableStyles.hint}`}
      content={getPremiumNote(token, sharesPerToken, premium)}
    >
      {formatPercent(premium * 100)} vs stock
    </Tooltip>
  )
}
