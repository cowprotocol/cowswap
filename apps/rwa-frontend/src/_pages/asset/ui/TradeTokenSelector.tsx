'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useId, useState } from 'react'

import { useConnection } from 'wagmi'

import {
  isQuoteUnavailable,
  isUnverifiedQuote,
  TradeTokenLogo,
  TradeTokenName,
  TradeTokenQuote,
} from './TradeTokenParts'
import styles from './TradeTokenSelector.module.css'

import { getBestQuoteLabel, getCollapsedQuotedTokens, isRankedQuote } from '../lib/quotedTokens'
import { formatTokenStat } from '../lib/tokenStat'
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
import { ConnectButton } from '@/features/connect-wallet'
import { getChainLabel } from '@/shared/lib/chain'
import { ChevronDownIcon, InfoIcon } from '@/shared/ui/icons'
import { useNetworkOptions } from '@/shared/ui/network-logos'
import { Select } from '@/shared/ui/select'
import { Tooltip } from '@/shared/ui/tooltip'

const COLLAPSED_TOKENS_COUNT = 2

const TRADE_SIDES: { side: RwaQuoteSide; title: string }[] = [
  { side: 'buy', title: 'Buy' },
  { side: 'sell', title: 'Sell' },
]

interface AllTokensToggleProps {
  count: number
  isExpanded: boolean
  /** Id of the tokens list */
  controls: string
  onToggle(): void
}

interface TradeTokenOptionProps {
  quoted: QuotedToken
  market: RwaMarketData | null | undefined
  /** Shown as a badge when set */
  bestQuoteLabel: string | null
  isSelected: boolean
  isLoading: boolean
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
  const { isConnected } = useConnection()
  const { side, chainId, quotedTokens, bestToken, assetToken, isAutoSelected, isQuotesLoading, quotesError } = selection
  const [areAllTokensShown, setAreAllTokensShown] = useState(false)
  const tokensListId = useId()
  const shownTokens = areAllTokensShown
    ? quotedTokens
    : getCollapsedQuotedTokens(quotedTokens, assetToken, COLLAPSED_TOKENS_COUNT)
  const sideTitle = side === 'buy' ? 'Buy' : 'Sell'
  const rankedCount = quotedTokens.filter(isRankedQuote).length
  const hasVerifiedQuote = quotedTokens.some((quoted) => isRankedQuote(quoted) && quoted.quote?.verified)
  const bestQuoteLabel = getBestQuoteLabel(side, hasVerifiedQuote)
  const shownBestToken = rankedCount > 1 ? bestToken : null
  const hasNoQuotes = !isQuotesLoading && !quotesError && quotedTokens.length > 0 && rankedCount === 0
  const hasOtherNetworks = asset.tokens.some((token) => token.chainId !== chainId)

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
        <NetworkSelect asset={asset} chainId={chainId} />
      </div>
      <div className={styles.tableHeader}>
        <span className={styles.tokenTitle}>Stock token</span>
        {!isAutoSelected && (
          <Tooltip className={styles.autoTrigger} content={`Trade the token with the ${bestQuoteLabel.toLowerCase()}`}>
            <button type="button" className={styles.auto} onClick={() => setTokenKey(null)}>
              Use auto
            </button>
          </Tooltip>
        )}
        <span className={styles.quoteTitle}>
          {sideTitle} quote / share
          <Tooltip
            className={styles.info}
            content={`Price per share for a $1,000 ${side} order, including network costs and fees. Tokens from different issuers may have different rights and risks.`}
          >
            <span role="img" aria-label="Quote details">
              <InfoIcon />
            </span>
          </Tooltip>
        </span>
      </div>
      {quotesError && <p className={styles.notice}>Quotes are unavailable: {quotesError.message}</p>}
      <ul id={tokensListId} className={styles.tokens} role="radiogroup" aria-label={`${asset.ticker} token`}>
        {shownTokens.map((quoted) => (
          <li key={getTokenKey(quoted.token)}>
            <TradeTokenOption
              quoted={quoted}
              market={market}
              bestQuoteLabel={quoted.token === shownBestToken ? bestQuoteLabel : null}
              isSelected={quoted.token === assetToken}
              isLoading={isQuotesLoading}
              onSelect={() => setTokenKey(getTokenKey(quoted.token))}
            />
          </li>
        ))}
      </ul>
      {hasNoQuotes && (
        <p className={styles.notice}>
          No quotes on {getChainLabel(chainId)} right now.
          {hasOtherNetworks && ' Switch network to see other tokens.'}
        </p>
      )}
      {quotedTokens.length > COLLAPSED_TOKENS_COUNT && (
        <AllTokensToggle
          count={quotedTokens.length}
          isExpanded={areAllTokensShown}
          controls={tokensListId}
          onToggle={() => setAreAllTokensShown((shown) => !shown)}
        />
      )}
      {!isConnected && (
        // In dapp mode (`standaloneMode: false`) the widget has no connect button of its own
        <div className={styles.connectPrompt}>
          <ConnectButton variant="secondary" />
          <span> to trade this tokenized asset.</span>
        </div>
      )}
    </div>
  )
}

function AllTokensToggle({ count, isExpanded, controls, onToggle }: AllTokensToggleProps): ReactNode {
  return (
    <button
      type="button"
      className={styles.allTokens}
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onToggle}
    >
      {isExpanded ? 'Fewer tokens' : `All ${count} tokens`}
      <ChevronDownIcon />
    </button>
  )
}

function NetworkSelect({ asset, chainId }: { asset: RwaAsset; chainId: number }): ReactNode {
  const selectNetwork = useSelectTradeNetwork()
  const options = useNetworkOptions([...new Set(asset.tokens.map((token) => token.chainId))], 20)

  return <Select variant="filled" aria-label="Network" value={chainId} options={options} onChange={selectNetwork} />
}

function TradeTokenOption({
  quoted,
  market,
  bestQuoteLabel,
  isSelected,
  isLoading,
  onSelect,
}: TradeTokenOptionProps): ReactNode {
  const isDisabled = isQuoteUnavailable(quoted, isLoading)
  const isChecked = isSelected && !isDisabled
  const { stats } = quoted

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      disabled={isDisabled}
      className={isChecked ? `${styles.option} ${styles.selected}` : styles.option}
      onClick={onSelect}
    >
      <TradeTokenLogo quoted={quoted} market={market} />
      <span className={styles.optionTitle}>
        <TradeTokenName quoted={quoted} bestQuoteLabel={bestQuoteLabel} />
        <span className={styles.stats}>
          <span>
            Onchain cap <strong>{formatTokenStat(stats?.onchainCap)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            24h vol <strong>{formatTokenStat(stats?.dexVolume24h)}</strong>
          </span>
        </span>
      </span>
      <TradeTokenQuote quoted={quoted} stockPrice={market?.price} isLoading={isLoading} />
      {isChecked && isUnverifiedQuote(quoted) && (
        <span className={styles.unverifiedNote}>Unverified price. It may change when you trade.</span>
      )}
    </button>
  )
}
