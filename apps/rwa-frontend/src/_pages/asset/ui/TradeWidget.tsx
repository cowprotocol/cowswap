'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { useChainId } from 'wagmi'

import { isSupportedChain } from '@cowprotocol/cow-sdk'
import { type CowSwapWidgetParams, type TokenInfo, TradeType } from '@cowprotocol/widget-lib'

import dynamic from 'next/dynamic'

import styles from './TradeWidget.module.css'

import type { RwaAsset, RwaToken } from '@/entities/asset'

import { useWalletProvider } from '@/shared/lib/wallet'

const CowSwapWidget = dynamic(() => import('@cowprotocol/widget-react').then((module) => module.CowSwapWidget), {
  ssr: false,
  loading: () => <p>Loading trading widget…</p>,
})

const APP_CODE = 'CoW RWA'
const SELL_ASSET = 'USDC'

export function TradeWidget({ asset }: { asset: RwaAsset }): ReactNode {
  const walletChainId = useChainId()
  const provider = useWalletProvider()
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null)

  const chainTokens = useMemo(() => {
    const onWalletChain = asset.tokens.filter((token) => token.chainId === walletChainId)

    if (onWalletChain.length) return onWalletChain

    const fallbackChainId = asset.tokens[0]?.chainId

    return asset.tokens.filter((token) => token.chainId === fallbackChainId)
  }, [asset.tokens, walletChainId])

  const buyToken = chainTokens.find((token) => getTokenKey(token) === selectedTokenKey) ?? chainTokens[0]

  const params = useMemo((): CowSwapWidgetParams | null => {
    if (!buyToken || !isSupportedChain(buyToken.chainId)) return null

    return {
      appCode: APP_CODE,
      width: '100%',
      height: '640px',
      chainId: buyToken.chainId,
      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
      sell: { asset: SELL_ASSET },
      buy: { asset: buyToken.address },
      customTokens: asset.tokens.map(toTokenInfo),
      standaloneMode: false,
      theme: 'light',
    }
  }, [asset.tokens, buyToken])

  if (!params || !buyToken) return <p>Trading is not available for {asset.ticker}</p>

  return (
    <section className={styles.widget}>
      {chainTokens.length > 1 && (
        <label className={styles.tokenSelect}>
          Token
          <select value={getTokenKey(buyToken)} onChange={(event) => setSelectedTokenKey(event.target.value)}>
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

function getTokenKey(token: RwaToken): string {
  return `${token.chainId}:${token.address}`
}

function toTokenInfo({ chainId, address, name, decimals, symbol }: RwaToken): TokenInfo {
  return { chainId, address, name, decimals, symbol }
}
