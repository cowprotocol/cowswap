'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useCallback, useMemo, useState } from 'react'

import { useConnection } from 'wagmi'

import { isSupportedChain } from '@cowprotocol/cow-sdk'
import { type CowSwapWidgetParams, type TokenInfo, TradeType } from '@cowprotocol/widget-lib'

import dynamic from 'next/dynamic'

import { TradeTokenSelector } from './TradeTokenSelector'
import styles from './TradeWidget.module.css'

import { getTradingPauseMessage } from '../lib/tradingPause'
import { TRADE_WIDGET_ID } from '../model/useSelectTradeToken'
import { useTradeSelection } from '../model/useTradeSelection'

import { assetQueryAtomFamily, type RwaAsset, type RwaToken } from '@/entities/asset'
import { ConnectButton } from '@/features/connect-wallet'
import { APP_CODE } from '@/shared/config'
import { useIsDarkTheme } from '@/shared/lib/theme'
import { useWalletProvider } from '@/shared/lib/wallet'

const CowSwapWidget = dynamic(() => import('@cowprotocol/widget-react').then((module) => module.CowSwapWidget), {
  ssr: false,
  loading: () => <TradeWidgetSkeleton />,
})

const QUOTE_ASSET = 'USDC'
const QUOTE_ASSET_AMOUNT = '1000'
const ASSET_TOKEN_AMOUNT = '1'

export function TradeWidget({ asset }: { asset: RwaAsset }): ReactNode {
  const provider = useWalletProvider()
  const { isConnected } = useConnection()
  const isDark = useIsDarkTheme()
  const selection = useTradeSelection(asset)
  const assetToken = selection?.assetToken
  const tradingPause = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.tradingPause
  const tradingPauseMessage =
    tradingPause?.issuer === assetToken?.issuer ? getTradingPauseMessage(tradingPause, new Date()) : null
  const side = selection?.side
  const [isWidgetLoading, setIsWidgetLoading] = useState(true)
  const onWidgetSettled = useCallback(() => setIsWidgetLoading(false), [])

  const params = useMemo((): CowSwapWidgetParams | null => {
    if (!assetToken || !isSupportedChain(assetToken.chainId)) return null

    const quote = { asset: QUOTE_ASSET, amount: QUOTE_ASSET_AMOUNT }

    return {
      appCode: APP_CODE,
      rootStyle: { width: '100%', height: 'var(--dynamicHeight, 640px)' },
      chainId: assetToken.chainId,
      tradeType: TradeType.SWAP,
      enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
      ...(side === 'buy'
        ? { sell: quote, buy: { asset: assetToken.address } }
        : { sell: { asset: assetToken.address, amount: ASSET_TOKEN_AMOUNT }, buy: { asset: QUOTE_ASSET } }),
      customTokens: asset.tokens.map(toTokenInfo),
      standaloneMode: false,
      theme: isDark ? 'dark' : 'light',
    }
  }, [asset.tokens, assetToken, side, isDark])

  if (!params || !selection) return <p>Trading is not available for {asset.ticker}</p>

  return (
    <section id={TRADE_WIDGET_ID} className={styles.widget}>
      <TradeTokenSelector asset={asset} selection={selection} />
      {tradingPauseMessage && <p className={styles.notice}>{tradingPauseMessage}</p>}
      {!isConnected && (
        // In dapp mode (`standaloneMode: false`) the widget has no connect button of its own
        <div className={styles.connectPrompt}>
          <span>Connect your wallet to trade this tokenized asset</span>
          <ConnectButton />
        </div>
      )}
      <p className={styles.disclaimer}>
        Tokens are issued by independent third parties and may not confer ownership of the underlying shares. Check
        issuer terms and eligibility before trading.
      </p>
      <div className={styles.frame} data-loading={isWidgetLoading || undefined}>
        <CowSwapWidget params={params} provider={provider} onReady={onWidgetSettled} onLoadingError={onWidgetSettled} />
        {isWidgetLoading && <TradeWidgetSkeleton overlay />}
      </div>
    </section>
  )
}

function toTokenInfo({ chainId, address, name, decimals, symbol }: RwaToken): TokenInfo {
  return { chainId, address, name, decimals, symbol }
}

function TradeWidgetSkeleton({ overlay = false }: { overlay?: boolean }): ReactNode {
  return (
    <div
      className={overlay ? `${styles.skeleton} ${styles.skeletonOverlay}` : styles.skeleton}
      role="status"
      aria-label="Loading trading widget"
    >
      <div className={styles.skeletonTabs}>
        <span className={`${styles.skeletonBlock} ${styles.skeletonTab}`} />
        <span className={`${styles.skeletonBlock} ${styles.skeletonTab}`} />
      </div>
      <span className={`${styles.skeletonBlock} ${styles.skeletonField}`} />
      <span className={`${styles.skeletonBlock} ${styles.skeletonField}`} />
      <span className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
    </div>
  )
}
