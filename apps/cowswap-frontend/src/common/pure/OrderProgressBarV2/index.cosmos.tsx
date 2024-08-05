import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { OrderProgressBarV2, OrderProgressBarV2Props } from './index'

const defaultProps: OrderProgressBarV2Props = {
  order: getOrderMock(SupportedChainId.MAINNET),
  stepName: 'initial',
  solverCompetition: [
    {
      solver: 'naive',
      sellAmount: '5000000000000000000',
      buyAmount: '1000000000000000000000',
    },
    { solver: 'uniswap', sellAmount: '5000000000000000000', buyAmount: '500000000000000000000' },
    { solver: 'oneinch', sellAmount: '5000000000000000000', buyAmount: '400000000000000000000' },
  ],
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  '1-initial': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} />
    </Wrapper>
  ),
  '2-solving': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="solving" countdown={15} />
    </Wrapper>
  ),
  '2a-delayed': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="delayed" />
    </Wrapper>
  ),
  '2b-unfillable': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="unfillable" />
    </Wrapper>
  ),
  '3-executing': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="executing" />
    </Wrapper>
  ),
  '3a-submissionFailed': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="submissionFailed" />
    </Wrapper>
  ),
  '4-finished': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="finished" />
    </Wrapper>
  ),
}

export default Fixtures
