import { UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const CloseIcon = styled(X)`
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`
