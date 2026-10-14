'use client'

import { type ReactNode, useMemo } from 'react'

import { useConnection } from 'wagmi'

import { isSupportedChain } from '@cowprotocol/cow-sdk'
import { type CowSwapWidgetParams, type TokenInfo, TradeType } from '@cowprotocol/widget-lib'

import dynamic from 'next/dynamic'

import { TradeTokenSelector } from './TradeTokenSelector'
import styles from './TradeWidget.module.css'

import { TRADE_WIDGET_ID } from '../model/useSelectTradeToken'
import { useTradeSelection } from '../model/useTradeSelection'

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

export function TradeWidget({ asset }: { asset: RwaAsset }): ReactNode {
  const provider = useWalletProvider()
  const { isConnected } = useConnection()
  const prefersDark = usePrefersDarkScheme()
  const selection = useTradeSelection(asset)
  const assetToken = selection?.assetToken
  const side = selection?.side

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

  if (!params || !selection) return <p>Trading is not available for {asset.ticker}</p>

  return (
    <section id={TRADE_WIDGET_ID} className={styles.widget}>
      <TradeTokenSelector asset={asset} selection={selection} />
      {!isConnected && (
        // In dapp mode (`standaloneMode: false`) the widget has no connect button of its own
        <div className={styles.connectPrompt}>
          <span>Connect your wallet to trade {asset.ticker}</span>
          <ConnectButton />
        </div>
      )}
      <CowSwapWidget params={params} provider={provider} />
    </section>
  )
}

function toTokenInfo({ chainId, address, name, decimals, symbol }: RwaToken): TokenInfo {
  return { chainId, address, name, decimals, symbol }
}
