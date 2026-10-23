import { USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'

import { activityDerivedStateMock } from 'mocks/activityDerivedStateMock'
import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ActivityStatus } from 'common/types/activity'

import { OrderProgressBarStepName } from '../../types'

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

const completedSwap: Order = {
  ...order,
  inputToken: USDC[SupportedChainId.MAINNET],
  outputToken: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  class: OrderClass.MARKET,
  status: OrderStatus.FULFILLED,
  apiAdditionalInfo: {
    executedBuyAmount: '1000000000000000000',
    executedSellAmount: '2000000000',
  } as Order['apiAdditionalInfo'],
}

const Fixtures = {
  'Take profit after swap': () => (
    <Wrapper>
      <TransactionSubmittedContent
        {...defaultProps}
        activityDerivedState={{ ...activityDerivedStateMock, status: ActivityStatus.CONFIRMED, order: completedSwap }}
        orderProgressBarProps={{
          ...defaultProps.orderProgressBarProps,
          order: completedSwap,
          stepName: OrderProgressBarStepName.FINISHED,
          isProgressBarSetup: true,
          isBridgingTrade: false,
        }}
      />
    </Wrapper>
  ),
  default: () => (
    <Wrapper>
      <TransactionSubmittedContent {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
