import { RequestCancellationModal, RequestCancellationModalProps } from './RequestCancellationModal'

const props: RequestCancellationModalProps = {
  onClick(): void {
    console.log(`clicked!!!`)
  },
  onDismiss(): void {
    console.log(`closed the modal!!!`)
  },
  shortId: '0x11111',
  summary: 'This was the order that got cancelled bla bla',
}

const Fixtures = {
  default: <RequestCancellationModal {...props} />,
}

export default Fixtures
