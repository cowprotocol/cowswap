import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState } from '@cowprotocol/tokens'

import { TokenSelectionHandler } from '../../../types'
import { selectTokenModalUIAtom } from '../atoms'
import { useWidgetCallbacks } from '../context/WidgetCallbacksContext'
import { useWidgetConfig } from '../context/WidgetConfigContext'

interface BlockingViewState {
  standalone: boolean
  tokenToImport: TokenWithLogo | undefined
  listToImport: ListState | undefined
  isManageWidgetOpen: boolean
  selectedPoolAddress: string | undefined
  allTokenLists: ListState[]
  userAddedTokens: TokenWithLogo[]
  onDismiss: () => void
  onBackFromImport: () => void
  onImportTokens: (tokens: TokenWithLogo[]) => void
  onImportList: (list: ListState) => void
  onCloseManageWidget: () => void
  onClosePoolPage: () => void
  onSelectToken: TokenSelectionHandler
}

export function useBlockingViewState(): BlockingViewState {
  const { standalone, tokenToImport, listToImport, selectedPoolAddress, allTokenLists, userAddedTokens } =
    useWidgetConfig()
  const {
    onDismiss,
    onBackFromImport,
    onImportTokens,
    onImportList,
    onCloseManageWidget,
    onClosePoolPage,
    onSelectToken,
  } = useWidgetCallbacks()
  const { isManageWidgetOpen } = useAtomValue(selectTokenModalUIAtom)

  return {
    standalone,
    tokenToImport,
    listToImport,
    isManageWidgetOpen,
    selectedPoolAddress,
    allTokenLists,
    userAddedTokens,
    onDismiss,
    onBackFromImport,
    onImportTokens,
    onImportList,
    onCloseManageWidget,
    onClosePoolPage,
    onSelectToken,
  }
}

export function useHasBlockingView(): boolean {
  const { isManageWidgetOpen } = useAtomValue(selectTokenModalUIAtom)
  const { standalone, tokenToImport, listToImport, selectedPoolAddress } = useWidgetConfig()

  return Boolean(
    (tokenToImport && !standalone) ||
      (listToImport && !standalone) ||
      (isManageWidgetOpen && !standalone) ||
      selectedPoolAddress,
  )
}
