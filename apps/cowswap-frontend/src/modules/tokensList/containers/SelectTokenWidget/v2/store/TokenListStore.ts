import { createContext, useContext } from 'react'

import { TokenListCategory } from '@cowprotocol/tokens'

import { TokenSelectionHandler } from '../../../../types'

export interface TokenListStore {
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void
}

const TokenListContext = createContext<TokenListStore | null>(null)

export const TokenListProvider = TokenListContext.Provider

export function useTokenListStore(): TokenListStore {
  const ctx = useContext(TokenListContext)
  if (!ctx) throw new Error('useTokenListStore must be used within TokenListProvider')
  return ctx
}
