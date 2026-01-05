import { useAtomValue } from 'jotai'

import { TokenListCategory } from '@cowprotocol/tokens'

import { tokenListViewAtom } from '../../../state/tokenListViewAtom'
import { TokenSelectionHandler } from '../../../types'
import { useWidgetCallbacks } from '../context/WidgetCallbacksContext'
import { useWidgetConfig } from '../context/WidgetConfigContext'

interface TokenListState {
  displayLpTokenLists: boolean
  tokenListCategoryState: [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]
  disableErc20: boolean
  isRouteAvailable: boolean | undefined
  account: string | undefined
  searchInput: string
  onSelectToken: TokenSelectionHandler
  openPoolPage: (poolAddress: string) => void
}

export function useTokenListState(): TokenListState {
  const { displayLpTokenLists, tokenListCategoryState, disableErc20, isRouteAvailable, account } = useWidgetConfig()
  const { onSelectToken, openPoolPage } = useWidgetCallbacks()
  const { searchInput } = useAtomValue(tokenListViewAtom)

  return {
    displayLpTokenLists,
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    account,
    searchInput,
    onSelectToken,
    openPoolPage,
  }
}
