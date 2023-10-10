import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { CommonListContainer } from '../../pure/commonElements'

export const Wrapper = styled(CommonListContainer)``

export const ListsContainer = styled.div`
  padding-bottom: 20px;
`

export const ImportListsContainer = styled.div`
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`
