'use client'

import { atom, useAtom, useAtomValue } from 'jotai'
import { type ReactNode, useMemo } from 'react'

import { useConnection } from 'wagmi'

import { AssetAbout } from './AssetAbout'
import styles from './AssetAccount.module.css'
import { AssetNews } from './AssetNews'
import { PositionsTab } from './PositionsTab'
import { RelatedAssets } from './RelatedAssets'
import { StockTokens } from './StockTokens'

import { type AssetAccountTab, assetAccountTabAtomFamily } from '../model/assetAccountTabAtom'

import { assetQueryAtomFamily, type RwaAsset, type RwaRelatedAsset, type RwaTokenSummary } from '@/entities/asset'
import {
  type AccountQueryParams,
  type AccountTab,
  AccountTabs,
  ActivityTable,
  activityQueryAtomFamily,
  ConnectPrompt,
  OpenOrdersTable,
  openOrdersQueryAtomFamily,
  useAccountBalances,
} from '@/widgets/account'

const noOpenOrdersAtom = atom<{ data?: readonly unknown[] }>({})

const CONNECT_HINTS: Record<Exclude<AssetAccountTab, 'overview'>, string> = {
  positions: 'see your positions',
  orders: 'see your open orders',
  activity: 'see your activity',
}

interface AssetAccountProps {
  asset: RwaAsset
  relatedAssets: RwaRelatedAsset[]
}

export function AssetAccount({ asset, relatedAssets }: AssetAccountProps): ReactNode {
  const { address } = useConnection()
  const [activeTab, setActiveTab] = useAtom(assetAccountTabAtomFamily(asset.ticker))
  // Kept here rather than in the tab so switching tabs doesn't reopen the balance streams
  const balances = useAccountBalances(address, asset.tokens)
  const openOrdersCount = useOpenOrdersCount(address, asset)
  const tabs: AccountTab<AssetAccountTab>[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'positions', title: 'Your positions', count: address ? balances.positions?.length : undefined },
    { id: 'orders', title: 'Open orders', count: openOrdersCount },
    { id: 'activity', title: 'Activity' },
  ]

  return (
    <AccountTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
      {activeTab === 'overview' ? (
        <>
          <StockTokens asset={asset} />
          <div className={styles.overview}>
            <AssetAbout asset={asset} />
            <AssetNews asset={asset} />
            <RelatedAssets assets={relatedAssets} />
          </div>
        </>
      ) : !address ? (
        <ConnectPrompt>Connect your wallet to {CONNECT_HINTS[activeTab]}</ConnectPrompt>
      ) : activeTab === 'positions' ? (
        <PositionsTab asset={asset} balances={balances} />
      ) : activeTab === 'orders' ? (
        <AssetOpenOrders asset={asset} params={{ owner: address, scope: asset.ticker, tokens: asset.tokens }} />
      ) : (
        <AssetActivity asset={asset} params={{ owner: address, scope: asset.ticker, tokens: asset.tokens }} />
      )}
    </AccountTabs>
  )
}

function AssetActivity({ asset, params }: { asset: RwaAsset; params: AccountQueryParams }): ReactNode {
  const { data, error } = useAtomValue(activityQueryAtomFamily(params))

  return (
    <ActivityTable
      activity={data}
      error={error}
      emptyText={`You have no ${params.scope} activity yet`}
      getLogoUrl={useTokenLogoUrl(asset)}
    />
  )
}

function AssetOpenOrders({ asset, params }: { asset: RwaAsset; params: AccountQueryParams }): ReactNode {
  const { data, error } = useAtomValue(openOrdersQueryAtomFamily(params))

  return (
    <OpenOrdersTable
      orders={data}
      error={error}
      emptyText={`You have no open ${params.scope} orders`}
      getLogoUrl={useTokenLogoUrl(asset)}
    />
  )
}

function useOpenOrdersCount(address: string | undefined, asset: RwaAsset): number | undefined {
  const ordersAtom = useMemo(
    () =>
      address
        ? openOrdersQueryAtomFamily({ owner: address, scope: asset.ticker, tokens: asset.tokens })
        : noOpenOrdersAtom,
    [address, asset.ticker, asset.tokens],
  )

  return useAtomValue(ordersAtom).data?.length || undefined
}

function useTokenLogoUrl(asset: RwaAsset): (token: RwaTokenSummary) => string | null {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market

  return (token) => (token.coingeckoId && market?.tokens[token.coingeckoId]?.logoUrl) || asset.logoUrl || null
}
