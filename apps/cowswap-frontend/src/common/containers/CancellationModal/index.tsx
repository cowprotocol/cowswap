import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { CancellationModal as Pure } from 'common/pure/CancellationModal'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
}

export function CancellationModal(props: CancellationModalProps): ReactNode {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} />
}
