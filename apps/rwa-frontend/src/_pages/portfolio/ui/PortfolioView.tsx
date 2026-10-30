'use client'

import { type ReactNode, useState } from 'react'

import { useConnection } from 'wagmi'

import { BalancesStatus } from './BalancesStatus'
import { HoldingsTable } from './HoldingsTable'
import styles from './Portfolio.module.css'
import { PortfolioFilters } from './PortfolioFilters'
import { PortfolioSummary } from './PortfolioSummary'

import { formatUtcTime } from '../lib/formatUtcTime'
import { NO_PORTFOLIO_FILTER, type PortfolioFilter } from '../lib/portfolioFilter'
import { type Portfolio, usePortfolio } from '../model/usePortfolio'

import type { RwaAssetSummary } from '@/entities/asset'

import { ConnectButton } from '@/features/connect-wallet'
import { StatusMessage } from '@/shared/ui/status-message'
import { type AccountTab, AccountTabs, ActivityTable, OpenOrdersTable } from '@/widgets/account'

interface PortfolioContentProps {
  owner: string
  assets: RwaAssetSummary[]
}

type PortfolioTab = 'positions' | 'orders' | 'activity'

export function PortfolioView({ assets }: { assets: RwaAssetSummary[] }): ReactNode {
  const { address } = useConnection()

  return (
    <div className={styles.page}>
      {address ? <PortfolioContent owner={address} assets={assets} /> : <DisconnectedPortfolio />}
    </div>
  )
}

function DisconnectedPortfolio(): ReactNode {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Portfolio</h1>
          <p className={styles.intro}>
            Your stock token holdings, open orders and activity, across issuers and networks.
          </p>
        </div>
      </header>
      <section className={styles.emptyCard} aria-labelledby="portfolio-connect-title">
        <h2 id="portfolio-connect-title">Connect your wallet to see your portfolio</h2>
        <p>Stock tokens you hold, from any issuer and network, show here with your open orders and activity.</p>
        <ConnectButton variant="secondary" />
      </section>
    </>
  )
}

function PortfolioContent({ owner, assets }: PortfolioContentProps): ReactNode {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('positions')
  const [filter, setFilter] = useState<PortfolioFilter>(NO_PORTFOLIO_FILTER)
  const portfolio = usePortfolio(owner, assets, filter)
  const { filteredHoldings, orders, activity } = portfolio

  const tabs: AccountTab<PortfolioTab>[] = [
    { id: 'positions', title: 'Positions', count: filteredHoldings?.length },
    { id: 'orders', title: 'Open orders', count: orders.data?.length },
    { id: 'activity', title: 'Activity' },
  ]

  return (
    <>
      <PortfolioSummary
        holdings={portfolio.holdings}
        error={portfolio.balancesError}
        failedChainIds={portfolio.failedChainIds}
        arePricesLoading={portfolio.arePricesLoading}
      />
      <AccountTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        toolbar={<PortfolioFilters assets={assets} filter={filter} onChange={setFilter} />}
      >
        {activeTab === 'positions' ? (
          <Positions portfolio={portfolio} />
        ) : activeTab === 'orders' ? (
          <OpenOrdersTable orders={orders.data} error={orders.error} emptyText="No open orders" />
        ) : (
          <ActivityTable activity={activity.data} error={activity.error} emptyText="No activity yet" />
        )}
      </AccountTabs>
    </>
  )
}

function Positions({ portfolio }: { portfolio: Portfolio }): ReactNode {
  const { filteredHoldings, balancesError, pricesUpdatedAt } = portfolio

  if (!filteredHoldings) {
    return (
      <StatusMessage>
        {balancesError ? `Failed to load balances: ${balancesError.message}` : 'Loading balances…'}
      </StatusMessage>
    )
  }

  return (
    <>
      {balancesError && <p className={styles.note}>Some balances are unavailable: {balancesError.message}</p>}
      <HoldingsTable holdings={filteredHoldings} getLogoUrl={portfolio.getLogoUrl} />
      <div className={styles.panelNote}>
        <p>
          Confirmed balances
          {pricesUpdatedAt && (
            <>
              {' · Prices updated '}
              <time dateTime={pricesUpdatedAt}>{formatUtcTime(Date.parse(pricesUpdatedAt))}</time>
            </>
          )}
        </p>
        <BalancesStatus progress={portfolio.balancesProgress} onRefresh={portfolio.refreshBalances} />
      </div>
    </>
  )
}
