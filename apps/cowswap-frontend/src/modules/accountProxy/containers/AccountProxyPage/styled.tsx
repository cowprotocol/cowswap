import { Media, UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { TokenListItem } from 'modules/tokensList'

export const Wrapper = styled.div`
  padding-bottom: 10px;
`

export const Title = styled.span`
  display: flex;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  padding: 0 16px 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  width: 100%;
`

export const TokenListItemStyled = styled(TokenListItem)`
  border-radius: 16px;
  padding: 12px;
  gap: 12px;

  ${Media.upToSmall()} {
    padding: 12px 8px;
    gap: 10px;
  }
`

export const LinkStyled = styled(Link)`
  text-decoration: none;

  &:hover svg path {
    stroke: var(${UI.COLOR_TEXT});
  }
`
