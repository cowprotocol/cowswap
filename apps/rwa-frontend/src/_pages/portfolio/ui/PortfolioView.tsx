'use client'

import { type ReactNode, useState } from 'react'

import { useConnection } from 'wagmi'

import { AllocationCard } from './AllocationCard'
import { HoldingsTable } from './HoldingsTable'
import styles from './Portfolio.module.css'
import { PortfolioFilters } from './PortfolioFilters'
import { PortfolioSummary } from './PortfolioSummary'
import { RecentActivityCard } from './RecentActivityCard'

import { NO_PORTFOLIO_FILTER, type PortfolioFilter } from '../lib/portfolioFilter'
import { usePortfolio } from '../model/usePortfolio'

import type { RwaAssetSummary } from '@/entities/asset'

import { formatDateTime } from '@/shared/lib/format'
import { StatusMessage } from '@/shared/ui/status-message'
import { type AccountTab, AccountTabs, ActivityTable, ConnectPrompt, OpenOrdersTable } from '@/widgets/account'

interface PortfolioContentProps {
  owner: string
  assets: RwaAssetSummary[]
}

type PortfolioTab = 'holdings' | 'orders' | 'activity'

export function PortfolioView({ assets }: { assets: RwaAssetSummary[] }): ReactNode {
  const { address } = useConnection()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Portfolio</h1>
      {address ? (
        <PortfolioContent owner={address} assets={assets} />
      ) : (
        <ConnectPrompt>Connect your wallet to see your portfolio</ConnectPrompt>
      )}
    </div>
  )
}

function PortfolioContent({ owner, assets }: PortfolioContentProps): ReactNode {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('holdings')
  const [filter, setFilter] = useState<PortfolioFilter>(NO_PORTFOLIO_FILTER)
  const portfolio = usePortfolio(owner, assets, filter)
  const { filteredHoldings, balancesError, orders, activity, pricesUpdatedAt } = portfolio

  const tabs: AccountTab<PortfolioTab>[] = [
    { id: 'holdings', title: 'Holdings', count: filteredHoldings?.length },
    { id: 'orders', title: 'Open orders', count: orders.data?.length },
    { id: 'activity', title: 'Activity', count: activity.data?.length },
  ]

  return (
    <>
      <PortfolioSummary
        owner={owner}
        holdings={portfolio.holdings}
        error={balancesError}
        failedChainIds={portfolio.failedChainIds}
        arePricesLoading={portfolio.arePricesLoading}
        balancesProgress={portfolio.balancesProgress}
        onRefreshBalances={portfolio.refreshBalances}
      />
      <div className={styles.cards}>
        <AllocationCard portfolio={portfolio} />
        <RecentActivityCard portfolio={portfolio} onViewAll={() => setActiveTab('activity')} />
      </div>
      <AccountTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        toolbar={<PortfolioFilters assets={assets} filter={filter} onChange={setFilter} />}
      >
        {activeTab === 'holdings' ? (
          filteredHoldings ? (
            <>
              {balancesError && <p className={styles.note}>Some balances are unavailable: {balancesError.message}</p>}
              <HoldingsTable holdings={filteredHoldings} getLogoUrl={portfolio.getLogoUrl} />
              <p className={styles.note}>
                Valued at underlying asset prices × equivalent shares. Actual sale proceeds may differ.
                {pricesUpdatedAt && ` Updated ${formatDateTime(Date.parse(pricesUpdatedAt) / 1000)}.`}
              </p>
            </>
          ) : (
            <StatusMessage>
              {balancesError ? `Failed to load balances: ${balancesError.message}` : 'Loading balances…'}
            </StatusMessage>
          )
        ) : activeTab === 'orders' ? (
          <OpenOrdersTable orders={orders.data} error={orders.error} emptyText="No open orders" />
        ) : (
          <ActivityTable activity={activity.data} error={activity.error} emptyText="No activity yet" />
        )}
      </AccountTabs>
    </>
  )
}
