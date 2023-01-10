import { useState } from 'react'
import { CancellationModalContext } from '@cow/common/hooks/useCancelOrder/state'
import { CancellationModal, CancellationModalProps } from '.'

const context: CancellationModalContext = {
  chainId: 1,
  orderId: '0x111',
  summary: 'SWAP 1 BLA for 5 BLI',
  error: null,
  isPendingSignature: false,
  onDismiss: null,
  triggerCancellation: async () => {
    alert('cancelling!!')
  },
  type: null,
}

const defaultProps: CancellationModalProps = {
  isOpen: false,
  onDismiss(): void {
    console.log(`closed the modal!!!`)
  },
  context,
}

function Wrapper(props: CancellationModalProps['context']) {
  const [isOpen, setIsOpen] = useState(true)
  const hideModal = () => setIsOpen(false)
  const cancelOrder = () => alert('Cancelling order!')
  const p = {
    ...defaultProps,
    onDismiss: hideModal,
    context: { ...defaultProps.context, ...props, hideModal, cancelOrder },
    isOpen,
  }

  return <CancellationModal {...p} />
}

function buildComponent(props?: Partial<CancellationModalProps['context']>) {
  const p = { ...context, ...props }
  return <Wrapper {...p} />
}

const Fixtures = {
  default: buildComponent(),
  error: buildComponent({ error: 'Failed to do stuff!!' }),
  offChainPending: buildComponent({ type: 'offChain', isPendingSignature: true }),
  offChain: buildComponent({ type: 'offChain' }),
  ethFlowPending: buildComponent({ type: 'ethFlow', isPendingSignature: true }),
  ethFlow: buildComponent({ type: 'ethFlow' }),
}

export default Fixtures
