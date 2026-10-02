'use client'

import type { ReactNode } from 'react'

import styles from './AccountTabs.module.css'

export interface AccountTab<T extends string> {
  id: T
  title: string
  /** Shown next to the title, omitted while unknown */
  count?: number
}

interface AccountTabsProps<T extends string> {
  tabs: AccountTab<T>[]
  activeTab: NoInfer<T>
  onChange(tab: NoInfer<T>): void
  /** Rendered next to the tabs, e.g. filters */
  toolbar?: ReactNode
  children: ReactNode
}

export function AccountTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  toolbar,
  children,
}: AccountTabsProps<T>): ReactNode {
  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Your account">
          {tabs.map(({ id, title, count }) => (
            <button
              key={id}
              id={`account-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={id === activeTab}
              aria-controls="account-tab-panel"
              className={id === activeTab ? styles.activeTab : undefined}
              onClick={() => onChange(id)}
            >
              {title}
              {count !== undefined && <span className={styles.count}>{count}</span>}
            </button>
          ))}
        </div>
        {toolbar}
      </div>
      <div id="account-tab-panel" role="tabpanel" aria-labelledby={`account-tab-${activeTab}`}>
        {children}
      </div>
    </section>
  )
}
