import styled from 'styled-components/macro'

import { TransactionErrorContent } from './index'

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: ${({ theme }) => theme.bg1};
`

const fixtures = {
  default: (
    <Wrapper>
      <TransactionErrorContent message={'User rejected transaction'} onDismiss={console.log} />
    </Wrapper>
  ),
}

export default fixtures
