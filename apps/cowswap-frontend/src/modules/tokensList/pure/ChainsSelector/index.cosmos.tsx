import styled from 'styled-components/macro'

import { ChainsSelector } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: (
    <Wrapper>
      <ChainsSelector />
    </Wrapper>
  ),
}

export default Fixtures
