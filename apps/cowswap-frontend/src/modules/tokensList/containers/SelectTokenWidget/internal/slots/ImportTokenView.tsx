/**
 * ImportTokenView Slot - Modal for importing a single token
 */
import { ReactNode } from 'react'

import { ImportTokenModal } from '../../../../pure/ImportTokenModal'
import { useImportTokenViewState } from '../../hooks'

export function ImportTokenView(): ReactNode {
  const state = useImportTokenViewState()

  if (!state) return null

  return (
    <ImportTokenModal
      tokens={[state.token]}
      restriction={state.restriction}
      onDismiss={state.onDismiss}
      onBack={state.onBack}
      onImport={state.onImport}
    />
  )
}
