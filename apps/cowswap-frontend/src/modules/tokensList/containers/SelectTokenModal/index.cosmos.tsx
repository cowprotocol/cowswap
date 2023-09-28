import styled from 'styled-components/macro'

import { allTokensMock, favouriteTokensMock } from './mocks'

import { SelectTokenModal } from './index'

const Wrapper = styled.div`
  max-width: 600px;
`

const Fixtures = {
  default: (
    <Wrapper>
      <SelectTokenModal allTokens={allTokensMock} favouriteTokens={favouriteTokensMock} />
    </Wrapper>
  ),
}

export default Fixtures
