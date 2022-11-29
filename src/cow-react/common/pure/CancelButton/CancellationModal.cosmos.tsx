import { CancellationModal, CancellationModalProps } from './CancellationModal'
import { SoftCancellationContext } from '@cow/common/pure/CancelButton/index'

const softCancellationContext: SoftCancellationContext = {
  cancelOrder() {
    console.log('cancelling!!!')
  },
  isWaitingSignature: false,
}

const defaultProps: CancellationModalProps = {
  chainId: 1,
  error: null,
  orderId: '0x23424',
  type: 'soft',
  onDismiss(): void {
    console.log(`closed the modal!!!`)
  },
  summary: 'This was the order that got cancelled bla bla',
  softCancellationContext,
}

function buildComponent(props: Partial<CancellationModalProps>) {
  const p = { ...defaultProps, ...props }
  return <CancellationModal {...p} />
}

const Fixtures = {
  default: buildComponent({}),
  error: buildComponent({ error: 'Something went wrong with this modal' }),
  // soft cancellation
  softCancellationWaitingSignature: buildComponent({
    softCancellationContext: { ...softCancellationContext, isWaitingSignature: true },
  }),
}

export default Fixtures
