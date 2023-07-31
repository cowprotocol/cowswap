import { useAtomValue } from '../../../legacy/state/application/atoms'

import { cancellationModalContextAtom } from '../../hooks/useCancelOrder/state'
import { CancellationModal as Pure } from '../../pure/CancellationModal'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: () => void
}

export function CancellationModal(props: CancellationModalProps) {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} />
}
