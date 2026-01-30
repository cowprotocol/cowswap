import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

export const CloseIcon = styled(X)<{ onClick: Command }>`
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`
