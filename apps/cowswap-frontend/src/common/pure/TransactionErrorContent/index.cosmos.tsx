import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TransactionErrorContent } from './index'

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: var(${UI.COLOR_PAPER});
`

const fixtures = {
  default: () => (
    <Wrapper>
      <TransactionErrorContent modalMode message={'User rejected transaction'} onDismiss={console.log} />
    </Wrapper>
  ),
}

export default fixtures
