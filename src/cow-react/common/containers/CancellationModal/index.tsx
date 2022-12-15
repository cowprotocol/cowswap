import { CancellationModal as Pure } from '@cow/common/pure/CancellationModal'
import { useAtomValue } from 'state/application/atoms'
import { cancellationModalContextAtom } from '@cow/common/hooks/useCancelOrder/state'

export type CancellationModalProps = {
  isOpen: boolean
  onDismiss: () => void
}

export function CancellationModal(props: CancellationModalProps) {
  const { isOpen, onDismiss } = props

  const context = useAtomValue(cancellationModalContextAtom)

  return <Pure isOpen={isOpen} onDismiss={onDismiss} context={context} />
}
