import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { importListsMock, listsMock } from '../../mocks'

import { ManageLists } from './index'

const Wrapper = styled.div`
  width: 450px;
  background: var(${UI.COLOR_CONTAINER_BG_01});
`

const Fixtures = {
  default: (
    <Wrapper>
      <ManageLists lists={listsMock} />
    </Wrapper>
  ),
  importList: (
    <Wrapper>
      <ManageLists lists={listsMock} listsToImport={importListsMock} />
    </Wrapper>
  ),
  loadedLists: (
    <Wrapper>
      <ManageLists lists={listsMock} loadedLists={importListsMock} />
    </Wrapper>
  ),
}

export default Fixtures
