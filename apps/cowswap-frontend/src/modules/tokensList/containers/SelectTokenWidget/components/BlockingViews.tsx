import { ReactNode } from 'react'

import { ImportListModal } from '../../../pure/ImportListModal'
import { ImportTokenModal } from '../../../pure/ImportTokenModal'
import { LpTokenPage } from '../../LpTokenPage'
import { ManageListsAndTokens } from '../../ManageListsAndTokens'
import { useBlockingViewState, useHasBlockingView as useHasBlockingViewHook } from '../hooks'

/**
 * SelectTokenWidget.BlockingView - Renders blocking modals (import token, import list, manage lists, LP page).
 * Returns null if no blocking view is active.
 * Uses useBlockingViewState hook that combines atoms + context.
 */
export function BlockingView(): ReactNode {
  const state = useBlockingViewState()

  // Import token modal
  if (state.tokenToImport && !state.standalone) {
    return (
      <ImportTokenModal
        tokens={[state.tokenToImport]}
        onDismiss={state.onDismiss}
        onBack={state.onBackFromImport}
        onImport={state.onImportTokens}
      />
    )
  }

  // Import list modal
  if (state.listToImport && !state.standalone) {
    return (
      <ImportListModal
        list={state.listToImport}
        onDismiss={state.onDismiss}
        onBack={state.onBackFromImport}
        onImport={state.onImportList}
      />
    )
  }

  // Manage lists and tokens
  if (state.isManageWidgetOpen && !state.standalone) {
    return (
      <ManageListsAndTokens
        lists={state.allTokenLists}
        customTokens={state.userAddedTokens}
        onDismiss={state.onDismiss}
        onBack={state.onCloseManageWidget}
      />
    )
  }

  // LP token page
  if (state.selectedPoolAddress) {
    return (
      <LpTokenPage
        poolAddress={state.selectedPoolAddress}
        onDismiss={state.onDismiss}
        onBack={state.onClosePoolPage}
        onSelectToken={state.onSelectToken}
      />
    )
  }

  return null
}

/**
 * Hook to check if a blocking view is active.
 * Re-exported from hooks for backwards compatibility.
 */
export const useHasBlockingView = useHasBlockingViewHook
