import styled from 'styled-components/macro'

import { customTokensMock } from '../../mocks'

import { ImportTokenModal } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: (
    <Wrapper>
      <ImportTokenModal
        token={customTokensMock[0]}
        onBack={() => console.log('onBack')}
        onClose={() => console.log('onClose')}
      />
    </Wrapper>
  ),
}

export default Fixtures
