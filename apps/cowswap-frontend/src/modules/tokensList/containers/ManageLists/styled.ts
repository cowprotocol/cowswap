import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CommonListContainer } from '../../pure/commonElements'

export const Wrapper = styled(CommonListContainer)``

export const ListsContainer = styled.div`
  padding-bottom: 20px;
  border-top: 1px solid var(${UI.COLOR_BORDER});
`

export const LoaderWrapper = styled.div`
  text-align: center;
  margin: 20px 0 10px 0;
`

export const ImportListsContainer = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
`

export const InputError = styled.div`
  padding: 0 20px 20px;
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
`
