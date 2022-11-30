import { LinkStyledButton } from 'theme'
import { CancellationModal } from './CancellationModal'

// TODO: add for each type when implemented
export type CancelButtonType = 'soft'

export type CancelButtonProps = {
  orderId: string
  summary: string | undefined
  chainId: number
  error: string | null
  showCancelModal: boolean
  type: CancelButtonType
  softCancellationContext?: SoftCancellationContext
  onCancelButtonClick: () => void
  onDismiss: () => void
}

export type SoftCancellationContext = {
  cancelOrder: () => void
  isWaitingSignature: boolean
}

export function CancelButton(props: CancelButtonProps) {
  const { showCancelModal, onCancelButtonClick, ...rest } = props

  return (
    <>
      <LinkStyledButton onClick={onCancelButtonClick}>Cancel order</LinkStyledButton>{' '}
      {showCancelModal && <CancellationModal {...rest} />}
    </>
  )
}
