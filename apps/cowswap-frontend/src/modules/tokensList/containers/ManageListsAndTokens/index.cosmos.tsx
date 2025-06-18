import styled from 'styled-components/macro'

import { customTokensMock, listsMock } from '../../mocks'

import { ManageListsAndTokens } from './index'

const Wrapper = styled.div`
  max-height: 90vh;
  margin: 20px auto;
  display: flex;
  width: 450px;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <ManageListsAndTokens
        customTokens={customTokensMock}
        lists={listsMock}
        onBack={() => console.log('onBack')}
        onDismiss={() => console.log('onDismiss')}
      />
    </Wrapper>
  ),
}

export default Fixtures
