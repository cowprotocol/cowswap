import {
  CancelButtonContent,
  CancelButtonContentProps,
  SoftCancellationContext,
} from '@cow/common/pure/CancelButton/index'
import { useState } from 'react'

const softCancellationContext: SoftCancellationContext = {
  cancelOrder() {
    console.log('cancelling!!!')
  },
  isWaitingSignature: false,
}

function Wrapper(props: Partial<CancelButtonContentProps>) {
  const [showCancelModal, setShowCancelModal] = useState(false)

  const p: CancelButtonContentProps = {
    onDismiss() {
      setShowCancelModal(false)
    },
    chainId: 1,
    error: null,
    orderId: '0x23424',
    type: 'soft',
    summary: 'This was the order that got cancelled bla bla',
    softCancellationContext,
    showCancelModal,
    onCancelButtonClick() {
      setShowCancelModal(true)
    },
    ...props,
  }
  return <CancelButtonContent {...p} />
}

const Fixtures = {
  default: <Wrapper />,
  error: <Wrapper error={'Something went wrong with this modal'} />,
  // soft cancellation
  softCancellationWaitingSignature: (
    <Wrapper softCancellationContext={{ ...softCancellationContext, isWaitingSignature: true }} />
  ),
}

export default Fixtures
