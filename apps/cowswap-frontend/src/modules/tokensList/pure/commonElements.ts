import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const IconButton = styled.button`
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    color: inherit;
  }
`

export const ImportButton = styled.button`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 16px;
  font-weight: 600;
  padding: 6px 15px;
  border-radius: 24px;
  transition: background-color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_DARKER});
  }
`

export const CommonListContainer = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;

  ${({ theme }) => theme.colorScrollbar};
`
