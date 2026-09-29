'use client'

import { type ReactNode, useState } from 'react'

import { useConnection } from 'wagmi'

import styles from './AccountTabs.module.css'
import { ActivityTab } from './ActivityTab'
import { OpenOrdersTab } from './OpenOrdersTab'
import { PositionsTab } from './PositionsTab'

import { useAssetBalances } from '../model/useAssetBalances'

import type { RwaAsset } from '@/entities/asset'

import { ConnectButton } from '@/features/connect-wallet'

type AccountTab = 'positions' | 'orders' | 'activity'

const TABS: { id: AccountTab; title: string; connectHint: string }[] = [
  { id: 'positions', title: 'Your positions', connectHint: 'see your positions' },
  { id: 'orders', title: 'Open orders', connectHint: 'see your open orders' },
  { id: 'activity', title: 'Activity', connectHint: 'see your activity' },
]

export function AccountTabs({ asset }: { asset: RwaAsset }): ReactNode {
  const { address } = useConnection()
  const [activeTab, setActiveTab] = useState<AccountTab>('positions')
  // Kept here rather than in the tab so switching tabs doesn't reopen the balance streams
  const balances = useAssetBalances(address, asset.tokens)
  const tab = TABS.find(({ id }) => id === activeTab) ?? TABS[0]

  return (
    <section className={styles.card}>
      <div className={styles.tabs} role="tablist" aria-label="Your account">
        {TABS.map(({ id, title }) => (
          <button
            key={id}
            id={`account-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={id === activeTab}
            aria-controls="account-tab-panel"
            className={id === activeTab ? styles.activeTab : undefined}
            onClick={() => setActiveTab(id)}
          >
            {title}
          </button>
        ))}
      </div>
      <div id="account-tab-panel" role="tabpanel" aria-labelledby={`account-tab-${tab.id}`}>
        {!address ? (
          <div className={styles.connectPrompt}>
            <span>Connect your wallet to {tab.connectHint}</span>
            <ConnectButton />
          </div>
        ) : tab.id === 'positions' ? (
          <PositionsTab asset={asset} balances={balances} />
        ) : tab.id === 'orders' ? (
          <OpenOrdersTab asset={asset} owner={address} />
        ) : (
          <ActivityTab asset={asset} owner={address} />
        )}
      </div>
    </section>
  )
}
