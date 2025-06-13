import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { importListsMock, listsMock } from '../../mocks'

import { ManageLists } from './index'

const Wrapper = styled.div`
  max-height: 90vh;
  margin: 20px auto;
  display: flex;
  width: 450px;
  background: var(${UI.COLOR_PAPER});
`

const emptyListSearchResponse = {
  source: 'external',
  response: {
    isLoading: false,
    data: undefined,
    error: undefined,
  },
}

const externalListSearchResponse = {
  source: 'external',
  response: {
    isLoading: false,
    data: importListsMock,
    error: undefined,
  },
}
const internalListSearchResponse = {
  source: 'existing',
  response: listsMock[0],
}

const Fixtures = {
  default: () => (
    <Wrapper>
      <ManageLists lists={listsMock} listSearchResponse={emptyListSearchResponse as never} />
    </Wrapper>
  ),
  importList: () => (
    <Wrapper>
      <ManageLists lists={listsMock} listSearchResponse={externalListSearchResponse as never} />
    </Wrapper>
  ),
  loadedLists: () => (
    <Wrapper>
      <ManageLists lists={listsMock} listSearchResponse={internalListSearchResponse as never} />
    </Wrapper>
  ),
}

export default Fixtures
