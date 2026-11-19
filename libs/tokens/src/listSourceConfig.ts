import type { LpTokenProvider, PersistentStateByChain } from '@cowprotocol/types'

export type ListSourceConfig = {
  widgetAppCode?: string
  category?: 'RWA'
  priority?: number
  enabledByDefault?: boolean
  lpTokenProvider?: LpTokenProvider
  source: string
}

export type ListsSourcesByNetwork = PersistentStateByChain<Array<ListSourceConfig>>
