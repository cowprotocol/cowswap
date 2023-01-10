import { RequestCancellationModal, RequestCancellationModalProps } from './RequestCancellationModal'

const props: Omit<RequestCancellationModalProps, 'type'> = {
  triggerCancellation(): void {
    alert('Clicked button!')
  },
  onDismiss(): void {
    alert('Dismissed modal!')
  },
  shortId: '0x11111',
  summary: 'This was the order that got cancelled bla bla',
}

const Fixtures = {
  offChain: <RequestCancellationModal {...props} type="offChain" />,
  onChain: <RequestCancellationModal {...props} type="onChain" />,
}

export default Fixtures
