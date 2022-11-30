import { useCallback, useEffect, useState } from 'react'
import { CancelButton as Pure, CancelButtonType } from '@cow/common/pure/CancelButton'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'
import { SupportedChainId } from 'constants/chains'

export type CancelButtonProps = {
  chainId: SupportedChainId
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
    <Pure
      orderId={orderId}
      summary={summary}
      chainId={chainId}
      error={error}
      type={type}
      showCancelModal={showCancelModal}
      onCancelButtonClick={() => setShowCancelModal(true)}
      onDismiss={onDismiss}
      softCancellationContext={softCancellationContext}
    />
  )
}
