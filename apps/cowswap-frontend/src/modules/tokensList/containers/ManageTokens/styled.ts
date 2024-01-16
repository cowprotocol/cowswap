import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../../pure/commonElements'

const RowBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const SearchResults = styled.div`
  margin-top: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const Header = styled(RowBox)`
  padding: 20px;
`

export const Title = styled.div`
  font-weight: 600;
  opacity: 0.65;
`

export const LinkButton = styled.button`
  ${blankButtonMixin};

  font-size: 16px;
  font-weight: 500;
  color: var(${UI.COLOR_LINK});
  margin-left: 10px;

  &:hover {
    opacity: 0.8;
  }
`

export const TokenItem = styled(RowBox)`
  padding: 0 20px;
  margin-bottom: 20px;
`

export const TokenInfo = styled(RowBox)`
  gap: 10px;
  font-weight: 600;
`

export const TipText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(${UI.COLOR_LINK});
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid var(${UI.COLOR_PAPER_DARKER});
`
