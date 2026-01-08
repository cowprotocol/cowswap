/**
 * ManageView Slot - Modal for managing token lists and custom tokens
 */
import { ReactNode } from 'react'

import { ManageListsAndTokens } from '../../../ManageListsAndTokens'
import { useManageViewState } from '../../hooks'

export function ManageView(): ReactNode {
  const state = useManageViewState()

  if (!state) return null

  return (
    <ManageListsAndTokens
      lists={state.lists}
      customTokens={state.customTokens}
      onDismiss={state.onDismiss}
      onBack={state.onBack}
    />
  )
}
