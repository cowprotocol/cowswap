import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

import { CancellationModal } from '@cow/common/containers/CancellationModal'
import { cancellationModalContextAtom } from '@cow/common/hooks/useCancelOrder/state'
import { useAtomValue } from 'state/application/atoms'
import { ConfirmationModal } from '@cow/common/containers/ConfirmationModal'
import { confirmationModalContextAtom } from '@cow/common/hooks/useConfirmationRequest'

export default function TopLevelModals() {
  const cancelModalOpen = useModalIsOpen(ApplicationModal.CANCELLATION)
  const cancelModalToggle = useToggleModal(ApplicationModal.CANCELLATION)
  const { onDismiss: onDismissCancellationModal } = useAtomValue(cancellationModalContextAtom)

  const confirmationModalOpen = useModalIsOpen(ApplicationModal.CONFIRMATION)
  const confirmationModalToggle = useToggleModal(ApplicationModal.CONFIRMATION)
  const { onDismiss: onDismissConfirmationModal } = useAtomValue(confirmationModalContextAtom)

  return (
    <>
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onDismiss={onDismissConfirmationModal || confirmationModalToggle}
      />
      <CancellationModal isOpen={cancelModalOpen} onDismiss={onDismissCancellationModal || cancelModalToggle} />
    </>
  )
}
