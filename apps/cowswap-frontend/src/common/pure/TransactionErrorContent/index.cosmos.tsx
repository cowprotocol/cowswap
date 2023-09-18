import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { TransactionErrorContent } from './index'

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: var(${UI.COLOR_CONTAINER_BG_01});
`

const fixtures = {
  default: (
    <Wrapper>
      <TransactionErrorContent message={'User rejected transaction'} onDismiss={console.log} />
    </Wrapper>
  ),
}

export default fixtures
