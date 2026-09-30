'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useMemo, useState } from 'react'

import Image from 'next/image'

import tableStyles from './AccountTable.module.css'
import styles from './StockTokens.module.css'

import { getTokenKey } from '../lib/tokenKey'
import { useSelectTradeToken } from '../model/useSelectTradeToken'

import type { TradeSide } from '../lib/tradeLeg'

import { assetQueryAtomFamily, type RwaAsset, type RwaToken, type RwaTokenMarketData } from '@/entities/asset'
import { getChainLabel } from '@/shared/lib/chain'
import { formatCompactUsd, formatUsd } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'

const ALL = ''
const LOGO_SIZE = 28

interface StockTokenRowProps {
  token: RwaToken
  market: RwaTokenMarketData | undefined
  onTrade(side: TradeSide): void
}

export function StockTokens({ asset }: { asset: RwaAsset }): ReactNode {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market
  const selectTradeToken = useSelectTradeToken()
  const [issuer, setIssuer] = useState(ALL)
  const [network, setNetwork] = useState(ALL)

  const issuers = useMemo(() => [...new Set(asset.tokens.map((token) => token.issuer))], [asset.tokens])
  const chainIds = useMemo(() => [...new Set(asset.tokens.map((token) => token.chainId))], [asset.tokens])
  const tokens = asset.tokens.filter(
    (token) => (issuer === ALL || token.issuer === issuer) && (network === ALL || String(token.chainId) === network),
  )

  return (
    <section className={styles.section} aria-labelledby="stock-tokens-title">
      <div className={styles.header}>
        <h2 id="stock-tokens-title">Stock tokens</h2>
        <dl className={styles.totals}>
          <div>
            <dt>24h volume</dt>
            <dd>{formatCompactUsd(market?.volume24h)}</dd>
          </div>
          <div>
            <dt>Market cap</dt>
            <dd>{formatCompactUsd(market?.marketCap)}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.filters}>
        <label>
          Issuer
          <select value={issuer} onChange={(event) => setIssuer(event.target.value)}>
            <option value={ALL}>All issuers</option>
            {issuers.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Network
          <select value={network} onChange={(event) => setNetwork(event.target.value)}>
            <option value={ALL}>All networks</option>
            {chainIds.map((chainId) => (
              <option key={chainId} value={String(chainId)}>
                {getChainLabel(chainId)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {tokens.length ? (
        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Token</th>
                <th>Network</th>
                <th className={tableStyles.numeric}>Indicative price</th>
                <th className={tableStyles.numeric}>24h volume</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <StockTokenRow
                  key={getTokenKey(token)}
                  token={token}
                  market={token.coingeckoId ? market?.tokens[token.coingeckoId] : undefined}
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

function StockTokenRow({ token, market, onTrade }: StockTokenRowProps): ReactNode {
  return (
    <tr>
      <td>
        <div className={styles.token}>
          <TokenLogo symbol={token.symbol} market={market} />
          <div>
            {token.symbol}
            <span className={tableStyles.secondary}>{token.issuer}</span>
          </div>
        </div>
      </td>
      <td>{getChainLabel(token.chainId)}</td>
      <td className={tableStyles.numeric}>{formatUsd(market?.price)}</td>
      <td className={tableStyles.numeric}>{formatCompactUsd(market?.volume24h)}</td>
      <td>
        <div className={styles.actions}>
          <button type="button" className={styles.buy} onClick={() => onTrade('buy')}>
            Buy
          </button>
          <button type="button" className={styles.sell} onClick={() => onTrade('sell')}>
            Sell
          </button>
        </div>
      </td>
    </tr>
  )
}

function TokenLogo({ symbol, market }: { symbol: string; market: RwaTokenMarketData | undefined }): ReactNode {
  if (!market?.logoUrl) return <span className={styles.logoPlaceholder}>{symbol.charAt(0)}</span>

  return <Image className={styles.logo} src={market.logoUrl} alt="" width={LOGO_SIZE} height={LOGO_SIZE} unoptimized />
}
