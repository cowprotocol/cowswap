import { Color } from '@cowprotocol/ui'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components/macro'

export const IconWrapper = styled(FontAwesomeIcon)`
  padding: 0 0.5rem 0 0;
  margin: 0;
  box-sizing: content-box;

  &:hover {
    cursor: pointer;
  }
`

export const Percentage = styled.span`
  color: ${Color.explorer_green};
`

export const Amount = styled.span`
  margin: 0 0.5rem 0 0;
`

export const Wrapper = styled.span``
