import { MAINNET_NATIVE_CURRENCY } from 'lib/hooks/useNativeCurrency'

import { RequestCancellationModal } from './RequestCancellationModal'
import { RequestCancellationModalProps } from './types'

const props: Omit<RequestCancellationModalProps, 'defaultType'> = {
  triggerCancellation(): void {
    alert('Clicked button!')
  },
  onDismiss(): void {
    alert('Dismissed modal!')
  },
  shortId: '0x11111',
  summary: 'This was the order that got cancelled bla bla',
  txCost: 150000000000000000n,
  nativeCurrency: MAINNET_NATIVE_CURRENCY,
}

const Fixtures = {
  offChain: () => <RequestCancellationModal {...props} defaultType="offChain" />,
  onChain: () => <RequestCancellationModal {...props} defaultType="onChain" />,
}

export default Fixtures
