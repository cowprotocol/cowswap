import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { activityDerivedStateMock } from 'mocks/activityDerivedStateMock'
import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { OrderProgressBar } from './index'

const defaultProps = {
  chainId: SupportedChainId.MAINNET,
  activityDerivedState: {
    ...activityDerivedStateMock,
    order: getOrderMock(SupportedChainId.MAINNET),
  },
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  default: (
    <Wrapper>
      <OrderProgressBar {...defaultProps} />
    </Wrapper>
  ),
}

export default Fixtures
