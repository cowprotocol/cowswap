import { useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'

import { CancellationModalContext } from 'common/hooks/useCancelOrder/state'
import { MAINNET_NATIVE_CURRENCY } from 'lib/hooks/useNativeCurrency'

import { CancellationModal, CancellationModalProps } from '.'

const context: CancellationModalContext = {
  chainId: 1,
  orderId: '0x111',
  summary: 'SWAP 1 BLA for 5 BLI',
  error: null,
  isPendingSignature: false,
  onDismiss: null,
  txCost: BigNumber.from('150000000000000000'),
  nativeCurrency: MAINNET_NATIVE_CURRENCY,
  triggerCancellation: async () => {
    alert('cancelling!!')
  },
  defaultType: 'offChain',
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
  offChainPending: buildComponent({ defaultType: 'offChain', isPendingSignature: true }),
  offChain: buildComponent({ defaultType: 'offChain' }),
  ethFlowPending: buildComponent({ defaultType: 'onChain', isPendingSignature: true }),
  ethFlow: buildComponent({ defaultType: 'onChain' }),
}

export default Fixtures
