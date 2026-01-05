import { ReactNode } from 'react'

import { ImportListModal } from '../../../pure/ImportListModal'
import { ImportTokenModal } from '../../../pure/ImportTokenModal'
import { LpTokenPage } from '../../LpTokenPage'
import { ManageListsAndTokens } from '../../ManageListsAndTokens'
import { useBlockingViewContext, useHeaderContext, useTokenListContext } from '../SelectTokenWidgetContext'

/**
 * SelectTokenWidget.BlockingView - Renders blocking modals (import token, import list, manage lists, LP page).
 * Returns null if no blocking view is active.
 */
export function BlockingView(): ReactNode {
  const blockingView = useBlockingViewContext()
  const header = useHeaderContext()
  const tokenList = useTokenListContext()

  // Import token modal
  if (blockingView.tokenToImport && !blockingView.standalone) {
    return (
      <ImportTokenModal
        tokens={[blockingView.tokenToImport]}
        onDismiss={header.onDismiss}
        onBack={blockingView.onBackFromImport}
        onImport={blockingView.onImportTokens}
      />
    )
  }

  // Import list modal
  if (blockingView.listToImport && !blockingView.standalone) {
    return (
      <ImportListModal
        list={blockingView.listToImport}
        onDismiss={header.onDismiss}
        onBack={blockingView.onBackFromImport}
        onImport={blockingView.onImportList}
      />
    )
  }

  // Manage lists and tokens
  if (blockingView.isManageWidgetOpen && !blockingView.standalone) {
    return (
      <ManageListsAndTokens
        lists={blockingView.allTokenLists}
        customTokens={blockingView.userAddedTokens}
        onDismiss={header.onDismiss}
        onBack={blockingView.onCloseManageWidget}
      />
    )
  }

  // LP token page
  if (blockingView.selectedPoolAddress) {
    return (
      <LpTokenPage
        poolAddress={blockingView.selectedPoolAddress}
        onDismiss={header.onDismiss}
        onBack={blockingView.onClosePoolPage}
        onSelectToken={tokenList.onSelectToken}
      />
    )
  }

  return null
}

/**
 * Hook to check if a blocking view is active.
 */
export function useHasBlockingView(): boolean {
  const blockingView = useBlockingViewContext()

  return Boolean(
    (blockingView.tokenToImport && !blockingView.standalone) ||
      (blockingView.listToImport && !blockingView.standalone) ||
      (blockingView.isManageWidgetOpen && !blockingView.standalone) ||
      blockingView.selectedPoolAddress,
  )
}
