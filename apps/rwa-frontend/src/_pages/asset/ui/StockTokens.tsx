'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useId, useMemo, useState } from 'react'

import tableStyles from './AccountTable.module.css'
import styles from './StockTokens.module.css'

import { getPremiumNote } from '../lib/premiumNote'
import { getTokenPriceSharesPerToken } from '../lib/tokenPriceShares'
import { useSelectTradeToken } from '../model/useSelectTradeToken'
import { useTradeSelection } from '../model/useTradeSelection'

import {
  assetQueryAtomFamily,
  DividendNotes,
  getTokenKey,
  type RwaAsset,
  type RwaQuoteSide,
  type RwaToken,
  type RwaTokenMarketData,
} from '@/entities/asset'
import { getChainLabel, getExplorerAddressUrl } from '@/shared/lib/chain'
import { formatCompactUsd, formatPercent, formatUsd, shortenAddress } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { useNetworkOptions } from '@/shared/ui/network-logos'
import { Select } from '@/shared/ui/select'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

interface DividendNotesToggleProps {
  isExpanded: boolean
  /** Id of the notes panel */
  controls: string
  onToggle(): void
}

interface StockTokenRowProps {
  token: RwaToken
  market: RwaTokenMarketData | undefined
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
  const tokens = asset.tokens.filter(
    (token) => (issuer === null || token.issuer === issuer) && (network === null || token.chainId === network),
  )

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
                <th className={tableStyles.numeric}>24h volume</th>
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
      <p className={tableStyles.warning}>Price and volume of a token are aggregated across all its networks</p>
    </section>
  )
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

function StockTokenRow({
  token,
  market,
  sharesPerToken,
  stockPrice,
  isSelected,
  onTrade,
}: StockTokenRowProps): ReactNode {
  const network = getChainLabel(token.chainId)
  const explorerUrl = getExplorerAddressUrl(token.chainId, token.address)
  const price = typeof market?.price === 'number' ? market.price / (sharesPerToken ?? 1) : market?.price

  return (
    <tr className={isSelected ? styles.selected : undefined} aria-current={isSelected || undefined}>
      <td>
        <div className={styles.token}>
          <TokenLogo symbol={token.symbol} logoUrl={market?.logoUrl} chainId={token.chainId} />
          <div className={styles.tokenText}>
            <span>
              <span className={styles.symbol}>{token.symbol}</span>
              <span className={styles.issuer}> · {token.issuer}</span>
            </span>
            {explorerUrl ? (
              <a className={styles.address} href={explorerUrl} target="_blank" rel="noopener noreferrer">
                {shortenAddress(token.address)} ↗
              </a>
            ) : (
              <span className={styles.address}>{shortenAddress(token.address)}</span>
            )}
          </div>
        </div>
      </td>
      <td className={tableStyles.numeric}>
        {typeof price === 'number' ? `≈ ${formatUsd(price)}` : formatUsd(price)}
        {typeof price === 'number' && stockPrice ? (
          <VsStock token={token} sharesPerToken={sharesPerToken} premium={price / stockPrice - 1} />
        ) : null}
      </td>
      <td className={tableStyles.numeric}>{formatCompactUsd(market?.volume24h)}</td>
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
