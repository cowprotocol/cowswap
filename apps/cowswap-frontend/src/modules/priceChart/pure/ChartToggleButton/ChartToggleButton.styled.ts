import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ToggleButton = styled.button`
  --maxSize: 28px;
  --iconSize: 18px;

  background: none;
  border: none;
  outline: none;
  padding: 4px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  border-radius: 8px;
  width: var(--maxSize);
  height: var(--maxSize);

  &:hover {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  > svg {
    width: var(--iconSize);
    height: var(--iconSize);
  }
`
