import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { activityDerivedStateMock } from 'mocks/activityDerivedStateMock'
import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { TransactionSubmittedContent } from './index'

const order = getOrderMock(SupportedChainId.MAINNET)

const defaultProps = {
  onDismiss() {
    console.log('onDismiss')
  },
  chainId: SupportedChainId.MAINNET,
  hash: '0x9999',
  currencyToAdd: order.inputToken,
  activityDerivedState: {
    ...activityDerivedStateMock,
    order,
  },
  orderProgressBarProps: {
    chainId: SupportedChainId.MAINNET,
    isProgressBarSetup: false,
    isBridgingTrade: true,
    showCancellationModal: () => {
      alert('Cancellation triggered!!')
    },
  },
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <TransactionSubmittedContent {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
