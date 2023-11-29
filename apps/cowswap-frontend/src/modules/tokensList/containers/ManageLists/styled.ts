import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CommonListContainer } from '../../pure/commonElements'

export const Wrapper = styled(CommonListContainer)``

export const ListsContainer = styled.div`
  padding-bottom: 20px;
`

export const LoaderWrapper = styled.div`
  text-align: center;
  margin: 20px 0 10px 0;
`

export const ImportListsContainer = styled.div`
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`
