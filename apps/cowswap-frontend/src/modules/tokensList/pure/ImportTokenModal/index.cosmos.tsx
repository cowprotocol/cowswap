import styled from 'styled-components/macro'

import { customTokensMock } from '../../mocks'

import { ImportTokenModal } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: () => (
    <Wrapper>
      <ImportTokenModal
        tokens={customTokensMock}
        onBack={() => console.log('onBack')}
        onDismiss={() => console.log('onClose')}
        onImport={() => console.log('onImport')}
      />
    </Wrapper>
  ),
}

export default Fixtures
