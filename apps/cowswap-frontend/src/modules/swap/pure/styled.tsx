import { UI } from '@cowprotocol/ui'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

export const StyledInfoIcon = styled(Info)`
  color: inherit;
  opacity: 0.6;
  line-height: 0;
  vertical-align: middle;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TransactionText = styled.span`
  display: flex;
  gap: 3px;
  cursor: pointer;

  > i {
    font-style: normal;
  }
`
