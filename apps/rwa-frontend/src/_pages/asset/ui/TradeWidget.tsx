'use client'

import { useAtom } from 'jotai'
import { type ReactNode, useMemo } from 'react'

import { useChainId, useConnection } from 'wagmi'

import { isSupportedChain } from '@cowprotocol/cow-sdk'
import { type CowSwapWidgetParams, type TokenInfo, TradeType } from '@cowprotocol/widget-lib'

import dynamic from 'next/dynamic'

import styles from './TradeWidget.module.css'

import { getTokenKey } from '../lib/tokenKey'
import { tradeSideAtom, tradeTokenKeyAtom } from '../model/tradeSelectionAtoms'
import { TRADE_WIDGET_ID } from '../model/useSelectTradeToken'

import type { TradeSide } from '../lib/tradeLeg'
import type { RwaAsset, RwaToken } from '@/entities/asset'

import { ConnectButton } from '@/features/connect-wallet'
import { usePrefersDarkScheme } from '@/shared/lib/theme'
import { useWalletProvider } from '@/shared/lib/wallet'

const CowSwapWidget = dynamic(() => import('@cowprotocol/widget-react').then((module) => module.CowSwapWidget), {
  ssr: false,
  loading: () => <p>Loading trading widget…</p>,
})

const APP_CODE = 'CoW RWA'
const QUOTE_ASSET = 'USDC'
const QUOTE_ASSET_AMOUNT = '1000'
const ASSET_TOKEN_AMOUNT = '1'

const TRADE_SIDES: { side: TradeSide; title: string }[] = [
  { side: 'buy', title: 'Buy' },
  { side: 'sell', title: 'Sell' },
]

export function TradeWidget({ asset }: { asset: RwaAsset }): ReactNode {
  const walletChainId = useChainId()
  const provider = useWalletProvider()
  const { isConnected } = useConnection()
  const prefersDark = usePrefersDarkScheme()
  const [side, setSide] = useAtom(tradeSideAtom)
  const [selectedTokenKey, setSelectedTokenKey] = useAtom(tradeTokenKeyAtom)

  const selectedToken = asset.tokens.find((token) => getTokenKey(token) === selectedTokenKey)
  const chainId = getTradeChainId(asset.tokens, selectedToken, isConnected ? walletChainId : undefined)
  const chainTokens = useMemo(() => asset.tokens.filter((token) => token.chainId === chainId), [asset.tokens, chainId])
  const assetToken = selectedToken?.chainId === chainId ? selectedToken : chainTokens[0]

  const params = useMemo((): CowSwapWidgetParams | null => {
    if (!assetToken || !isSupportedChain(assetToken.chainId)) return null

    const quote = { asset: QUOTE_ASSET, amount: QUOTE_ASSET_AMOUNT }

    return {
      appCode: APP_CODE,
      width: '100%',
      height: '640px',
      chainId: assetToken.chainId,
      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
      ...(side === 'buy'
        ? { sell: quote, buy: { asset: assetToken.address } }
        : { sell: { asset: assetToken.address, amount: ASSET_TOKEN_AMOUNT }, buy: { asset: QUOTE_ASSET } }),
      customTokens: asset.tokens.map(toTokenInfo),
      standaloneMode: false,
      theme: prefersDark ? 'dark' : 'light',
    }
  }, [asset.tokens, assetToken, side, prefersDark])

  if (!params || !assetToken) return <p>Trading is not available for {asset.ticker}</p>

  return (
    <section id={TRADE_WIDGET_ID} className={styles.widget}>
      <div className={styles.sides} role="group" aria-label="Trade side">
        {TRADE_SIDES.map(({ side: option, title }) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === side}
            className={option === side ? styles[option] : undefined}
            onClick={() => setSide(option)}
          >
            {title} {asset.ticker}
          </button>
        ))}
      </div>
      {!isConnected && (
        // In dapp mode (`standaloneMode: false`) the widget has no connect button of its own
        <div className={styles.connectPrompt}>
          <span>Connect your wallet to trade {asset.ticker}</span>
          <ConnectButton />
        </div>
      )}
      {chainTokens.length > 1 && (
        <label className={styles.tokenSelect}>
          Token
          <select value={getTokenKey(assetToken)} onChange={(event) => setSelectedTokenKey(event.target.value)}>
            {chainTokens.map((token) => (
              <option key={getTokenKey(token)} value={getTokenKey(token)}>
                {token.symbol} — {token.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <CowSwapWidget params={params} provider={provider} />
    </section>
  )
}

/** The wallet chain wins over the selected token's one, because the widget follows the wallet */
function getTradeChainId(
  tokens: RwaToken[],
  selectedToken: RwaToken | undefined,
  walletChainId: number | undefined,
): number | undefined {
  if (walletChainId !== undefined && tokens.some((token) => token.chainId === walletChainId)) return walletChainId

  return selectedToken?.chainId ?? tokens[0]?.chainId
}

function toTokenInfo({ chainId, address, name, decimals, symbol }: RwaToken): TokenInfo {
  return { chainId, address, name, decimals, symbol }
}
