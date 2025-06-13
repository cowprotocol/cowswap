import { useAtomValue } from 'jotai'

import { Command } from '@cowprotocol/types'

import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { CancellationModal as Pure } from 'common/pure/CancellationModal'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CancellationModal(props: CancellationModalProps) {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} />
}
