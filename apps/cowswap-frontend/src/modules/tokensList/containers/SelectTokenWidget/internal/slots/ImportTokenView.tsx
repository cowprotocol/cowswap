import { ReactNode } from 'react'

import { ImportTokenModal, ImportTokenModalProps } from '../../../../pure/ImportTokenModal'
import { useImportTokenViewState } from '../../hooks'

export interface ImportTokenViewProps {
  flowData?: Partial<ImportTokenModalProps>
}

export function ImportTokenView({ flowData }: ImportTokenViewProps): ReactNode {
  const state = useImportTokenViewState()

  if (!state) return null

  return (
    <ImportTokenModal
      tokens={[state.token]}
      onDismiss={state.onDismiss}
      onBack={state.onBack}
      onImport={state.onImport}
      {...flowData}
    />
  )
}
