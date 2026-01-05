import { createContext, ReactNode, useContext } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState, TokenListCategory } from '@cowprotocol/tokens'

import { ChainsToSelectState } from '../../../types'

export interface WidgetConfig {
  // Header
  title: string
  showManageButton: boolean

  // Chain
  chainsPanelTitle: string
  chainsToSelect: ChainsToSelectState | undefined

  // Token list
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined

  // Blocking views data
  tokenToImport: TokenWithLogo | undefined
  listToImport: ListState | undefined
  selectedPoolAddress: string | undefined
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  standalone: boolean
}

const WidgetConfigContext = createContext<WidgetConfig | null>(null)

export function useWidgetConfig(): WidgetConfig {
  const ctx = useContext(WidgetConfigContext)
  if (!ctx) {
    throw new Error('useWidgetConfig must be used within WidgetConfigProvider')
  }
  return ctx
}

interface ProviderProps {
  children: ReactNode
  value: WidgetConfig
}

export function WidgetConfigProvider({ children, value }: ProviderProps): ReactNode {
  return <WidgetConfigContext.Provider value={value}>{children}</WidgetConfigContext.Provider>
}
