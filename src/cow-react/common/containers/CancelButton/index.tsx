import { ChainId } from 'state/lists/actions/actionsMod'
import { CancelButtonContent, CancelButtonType } from '@cow/common/pure/CancelButton'
import { useCallback, useEffect, useState } from 'react'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'

export type CancelButtonProps = {
  chainId: ChainId
  summary: string | undefined
  orderId: string
  type: CancelButtonType
}

export function CancelButton(props: CancelButtonProps) {
  const { chainId, summary, orderId, type } = props

  const [isWaitingSignature, setIsWaitingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const cancelOrder = useCancelOrder()

  const onDismiss = useCallback(() => setShowCancelModal(false), [])

  useEffect(() => {
    // Reset status every time orderId changes to avoid race conditions
    setIsWaitingSignature(false)
    setError(null)
  }, [orderId])

  const onClick = useCallback(() => {
    setIsWaitingSignature(true)
    setError(null)

    cancelOrder(orderId)
      .then(onDismiss)
      .catch((e) => {
        setError(e.message)
      })
  }, [cancelOrder, onDismiss, orderId])

  const softCancellationContext = {
    isWaitingSignature,
    cancelOrder: onClick,
  }

  return (
    <CancelButtonContent
      orderId={orderId}
      summary={summary}
      chainId={chainId}
      error={error}
      type={type}
      showCancelModal={showCancelModal}
      setShowCancelModal={setShowCancelModal}
      onDismiss={onDismiss}
      softCancellationContext={softCancellationContext}
    />
  )
}
