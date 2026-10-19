'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useState } from 'react'

import { useConnection } from 'wagmi'

import { AssetAbout } from './AssetAbout'
import styles from './AssetAccount.module.css'
import { AssetNews } from './AssetNews'
import { PositionsTab } from './PositionsTab'
import { StockTokens } from './StockTokens'

import type { RwaAsset } from '@/entities/asset'

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

type AssetAccountTab = 'overview' | 'positions' | 'orders' | 'activity'

const CONNECT_HINTS: Record<Exclude<AssetAccountTab, 'overview'>, string> = {
  positions: 'see your positions',
  orders: 'see your open orders',
  activity: 'see your activity',
}

export function AssetAccount({ asset }: { asset: RwaAsset }): ReactNode {
  const { address } = useConnection()
  const [activeTab, setActiveTab] = useState<AssetAccountTab>('overview')
  // Kept here rather than in the tab so switching tabs doesn't reopen the balance streams
  const balances = useAccountBalances(address, asset.tokens)
  const tabs: AccountTab<AssetAccountTab>[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'positions', title: 'Your positions', count: address ? balances.positions?.length : undefined },
    { id: 'orders', title: 'Open orders' },
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
          </div>
        </>
      ) : !address ? (
        <ConnectPrompt>Connect your wallet to {CONNECT_HINTS[activeTab]}</ConnectPrompt>
      ) : activeTab === 'positions' ? (
        <PositionsTab asset={asset} balances={balances} />
      ) : activeTab === 'orders' ? (
        <AssetOpenOrders params={{ owner: address, scope: asset.ticker, tokens: asset.tokens }} />
      ) : (
        <AssetActivity params={{ owner: address, scope: asset.ticker, tokens: asset.tokens }} />
      )}
    </AccountTabs>
  )
}

function AssetActivity({ params }: { params: AccountQueryParams }): ReactNode {
  const { data, error } = useAtomValue(activityQueryAtomFamily(params))

  return <ActivityTable activity={data} error={error} emptyText={`You have no ${params.scope} activity yet`} />
}

function AssetOpenOrders({ params }: { params: AccountQueryParams }): ReactNode {
  const { data, error } = useAtomValue(openOrdersQueryAtomFamily(params))

  return <OpenOrdersTable orders={data} error={error} emptyText={`You have no open ${params.scope} orders`} />
}
