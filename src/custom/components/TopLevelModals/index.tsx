import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

import { CancellationModal } from '@cow/common/containers/CancellationModal'
import { cancellationModalContextAtom } from '@cow/common/hooks/useCancelOrder/state'
import { useAtomValue } from 'state/application/atoms'
import { MultipleOrdersCancellationModal } from '@cow/common/containers/MultipleOrdersCancellationModal'

export default function TopLevelModals() {
  const cancelModalOpen = useModalIsOpen(ApplicationModal.CANCELLATION)
  const multipleCancelModalOpen = useModalIsOpen(ApplicationModal.MULTIPLE_CANCELLATION)

  const cancelModalToggle = useToggleModal(ApplicationModal.CANCELLATION)
  const multipleCancelModalToggle = useToggleModal(ApplicationModal.MULTIPLE_CANCELLATION)

  const { onDismiss: onDismissCancellationModal } = useAtomValue(cancellationModalContextAtom)

  return (
    <>
      <CancellationModal isOpen={cancelModalOpen} onDismiss={onDismissCancellationModal || cancelModalToggle} />
      <MultipleOrdersCancellationModal isOpen={multipleCancelModalOpen} onDismiss={multipleCancelModalToggle} />
    </>
  )
}
