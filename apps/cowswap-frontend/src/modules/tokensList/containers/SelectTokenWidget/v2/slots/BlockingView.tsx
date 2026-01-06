/**
 * BlockingView Slot - Full-screen modals that take over the widget
 */
import { ReactNode } from 'react'

import { ImportListModal } from '../../../../pure/ImportListModal'
import { ImportTokenModal } from '../../../../pure/ImportTokenModal'
import { LpTokenPage } from '../../../LpTokenPage'
import { ManageListsAndTokens } from '../../../ManageListsAndTokens'
import { useBlockingViewStore } from '../store'

export function BlockingView(): ReactNode {
  const state = useBlockingViewStore()

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
