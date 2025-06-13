import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ARROW_ICON_SIZE = '12px'

export const StyledToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: ${ARROW_ICON_SIZE};
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  color: var(${UI.COLOR_TEXT_OPACITY_50});

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: inherit;

    path {
      fill: currentColor;
      transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
    }
  }
`
