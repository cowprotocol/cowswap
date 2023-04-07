import { RequestCancellationModal, RequestCancellationModalProps } from './RequestCancellationModal'
import { MAINNET_NATIVE_CURRENCY } from '@src/lib/hooks/useNativeCurrency'

const props: Omit<RequestCancellationModalProps, 'defaultType'> = {
  triggerCancellation(): void {
    alert('Clicked button!')
  },
  onDismiss(): void {
    alert('Dismissed modal!')
  },
  shortId: '0x11111',
  summary: 'This was the order that got cancelled bla bla',
  // TODO: add cases
  txCost: null,
  nativeCurrency: MAINNET_NATIVE_CURRENCY,
}

const Fixtures = {
  offChain: <RequestCancellationModal {...props} defaultType="offChain" />,
  onChain: <RequestCancellationModal {...props} defaultType="onChain" />,
}

export default Fixtures
