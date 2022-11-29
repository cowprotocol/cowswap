import React from 'react'
import { LinkStyledButton } from 'theme'
import { CancellationModal } from './CancellationModal'

// TODO: add for each type when implemented
export type CancelButtonType = 'soft'

export type CancelButtonContentProps = {
  orderId: string
  summary: string | undefined
  chainId: number
  error: string | null
  setShowCancelModal: React.Dispatch<React.SetStateAction<boolean>>
  onDismiss: () => void
  showCancelModal: boolean
  type: CancelButtonType
  softCancellationContext?: SoftCancellationContext
}

export type SoftCancellationContext = {
  cancelOrder: () => void
  isWaitingSignature: boolean
}

export function CancelButtonContent(props: CancelButtonContentProps) {
  const { showCancelModal, setShowCancelModal, ...rest } = props

  const onCancelClick = () => setShowCancelModal(true)

  return (
    <>
      <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>{' '}
      {showCancelModal && <CancellationModal {...rest} />}
    </>
  )
}
