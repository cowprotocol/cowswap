import { useAtomValue } from 'jotai'

import { useModalIsOpen, useToggleModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { CancellationModal } from 'common/containers/CancellationModal'
import { ConfirmationModal } from 'common/containers/ConfirmationModal'
import { MultipleOrdersCancellationModal } from 'common/containers/MultipleOrdersCancellationModal'
import { cancellationModalContextAtom } from 'common/hooks/useCancelOrder/state'
import { confirmationModalContextAtom } from 'common/hooks/useConfirmationRequest'

export default function TopLevelModals() {
  const cancelModalOpen = useModalIsOpen(ApplicationModal.CANCELLATION)
  const confirmationModalOpen = useModalIsOpen(ApplicationModal.CONFIRMATION)
  const multipleCancelModalOpen = useModalIsOpen(ApplicationModal.MULTIPLE_CANCELLATION)

  const cancelModalToggle = useToggleModal(ApplicationModal.CANCELLATION)
  const confirmationModalToggle = useToggleModal(ApplicationModal.CONFIRMATION)
  const multipleCancelModalToggle = useToggleModal(ApplicationModal.MULTIPLE_CANCELLATION)

  const { onDismiss: onDismissCancellationModal } = useAtomValue(cancellationModalContextAtom)
  const { onDismiss: onDismissConfirmationModal } = useAtomValue(confirmationModalContextAtom)

  return (
    <>
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onDismiss={onDismissConfirmationModal || confirmationModalToggle}
      />
      <CancellationModal isOpen={cancelModalOpen} onDismiss={onDismissCancellationModal || cancelModalToggle} />
      <MultipleOrdersCancellationModal isOpen={multipleCancelModalOpen} onDismiss={multipleCancelModalToggle} />
    </>
  )
}
