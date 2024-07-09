import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { OrderProgressBar, OrderProgressBarProps } from './index'

const defaultProps: OrderProgressBarProps = {
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
      <OrderProgressBar {...defaultProps} />
    </Wrapper>
  ),
  '2-solving': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="solving" countdown={15} />
    </Wrapper>
  ),
  '2a-delayed': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="delayed" />
    </Wrapper>
  ),
  '2b-unfillable': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="unfillable" />
    </Wrapper>
  ),
  '3-executing': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="executing" />
    </Wrapper>
  ),
  '3a-submissionFailed': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="submissionFailed" />
    </Wrapper>
  ),
  '4-finished': (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="finished" />
    </Wrapper>
  ),
}

export default Fixtures
