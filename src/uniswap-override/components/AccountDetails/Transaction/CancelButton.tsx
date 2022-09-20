import { useState } from 'react'
import { LinkStyledButton } from 'theme'
import { ActivityDerivedState } from './index'
import { CancellationModal } from './CancelationModal'

export function CancelButton(props: { chainId: number; activityDerivedState: ActivityDerivedState }) {
  const { activityDerivedState, chainId } = props
  const { id, summary } = activityDerivedState

  const [showCancelModal, setShowCancelModal] = useState(false)

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <>
      <LinkStyledButton onClick={onCancelClick}>Cancel order</LinkStyledButton>{' '}
      {showCancelModal && (
        <CancellationModal
          chainId={chainId}
          orderId={id}
          summary={summary}
          isOpen={showCancelModal}
          onDismiss={onDismiss}
        />
      )}
    </>
  )
}
