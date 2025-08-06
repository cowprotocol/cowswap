import { UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { TokenListItem } from 'modules/tokensList'

export const Wrapper = styled.div`
  padding-bottom: 10px;
`

export const Title = styled.h3`
  margin: 20px 0 10px 10px !important;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ChevronWrapper = styled.div`
  align-self: center;
  margin-right: -10px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

export const TokenListItemStyled = styled(TokenListItem)`
  border-radius: 8px;
  margin-bottom: 6px;
`

export const LinkStyled = styled(Link)`
  text-decoration: none !important;
`
