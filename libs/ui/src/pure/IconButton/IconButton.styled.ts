import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const Button = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--size);
  color: var(--color, ${UI.COLOR_TEXT_OPACITY_50});
  line-height: 1;

  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    font-size var(${UI.ANIMATION_DURATION}) ease-in-out;

  // TODO: Should we add a global CSS reset instead?
  border: none;
  padding: 0;
  margin: 0;
  background: none;
  outline: none;

  &::before {
    content: '';
    position: absolute;
    inset: var(--pressableInset, 0);
  }

  &:not(:disabled):hover {
    color: var(--colorHover, ${UI.COLOR_TEXT});
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`
