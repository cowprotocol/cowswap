/**
 * ImportListView Slot - Modal for importing a token list
 */
import { ReactNode } from 'react'

import { ImportListModal } from '../../../../pure/ImportListModal'
import { useImportListViewState } from '../../hooks'

export function ImportListView(): ReactNode {
  const state = useImportListViewState()

  if (!state) return null

  return (
    <ImportListModal list={state.list} onDismiss={state.onDismiss} onBack={state.onBack} onImport={state.onImport} />
  )
}
