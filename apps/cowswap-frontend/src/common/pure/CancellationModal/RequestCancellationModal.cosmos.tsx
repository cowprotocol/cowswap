import { BigNumber } from '@ethersproject/bignumber'

import { MAINNET_NATIVE_CURRENCY } from 'lib/hooks/useNativeCurrency'

import { RequestCancellationModal, RequestCancellationModalProps } from './RequestCancellationModal'

const props: Omit<RequestCancellationModalProps, 'defaultType'> = {
  triggerCancellation(): void {
    alert('Clicked button!')
  },
  onDismiss(): void {
    alert('Dismissed modal!')
  },
  shortId: '0x11111',
  summary: 'This was the order that got cancelled bla bla',
  txCost: BigNumber.from('150000000000000000'),
  nativeCurrency: MAINNET_NATIVE_CURRENCY,
}

const Fixtures = {
  offChain: () => <RequestCancellationModal {...props} defaultType="offChain" />,
  onChain: () => <RequestCancellationModal {...props} defaultType="onChain" />,
}

export default Fixtures
