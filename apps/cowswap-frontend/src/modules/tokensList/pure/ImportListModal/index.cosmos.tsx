import styled from 'styled-components/macro'

import { importListsMock } from '../../mocks'

import { ImportListModal } from './index'

const Wrapper = styled.div`
  width: 450px;
`

const Fixtures = {
  default: (
    <Wrapper>
      <ImportListModal
        list={importListsMock[0]}
        onBack={() => console.log('onBack')}
        onClose={() => console.log('onClose')}
        onImport={() => console.log('onImport')}
      />
    </Wrapper>
  ),
}

export default Fixtures
