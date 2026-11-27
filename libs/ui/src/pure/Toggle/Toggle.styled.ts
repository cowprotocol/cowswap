import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const Input = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
`

export const ToggleThumb = styled.span`
  position: absolute;
  top: var(--offset);
  bottom: var(--offset);
  left: var(--offset);
  aspect-ratio: 1;
  border-radius: var(--height);
  background: var(--thumb-inactive);
  color: var(${UI.COLOR_BUTTON_TEXT_DISABLED});
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    transform 0.1s ease-in;

  ${Input}:checked + & {
    background: var(--thumb-active);
    color: var(${UI.COLOR_BUTTON_TEXT});
    transform: translateX(calc(var(--height) * 1.618 - var(--height)));
  }

  ${Input}:disabled + & {
    opacity: 0.5;
  }
`

export const Wrapper = styled.div`
  /*
    touch devices: visually larger
    mouse: visually smaller

    Hit areas are the same if wrapped in a label.
  */

  --height: 32px;
  --offset: 4px;
  --track-inactive: var(${UI.COLOR_PAPER_DARKER});
  --track-active: var(${UI.COLOR_PRIMARY_OPACITY_25});
  --thumb-inactive: var(${UI.COLOR_PRIMARY_OPACITY_50});
  --thumb-active: var(${UI.COLOR_PRIMARY});
  --thumb-hover: var(${UI.COLOR_PRIMARY});
  --thumb-hover-checked: var(${UI.COLOR_PRIMARY_LIGHTER});

  @media (pointer: fine) {
    --height: 24px;
  }

  position: relative;
  display: block;
  background: var(--track-inactive);
  border-radius: var(--height);
  cursor: pointer;
  width: calc(var(--height) * 1.618);
  height: var(--height);

  &:has(${Input}:checked) {
    background: var(--track-active);
  }

  &:has(${Input}:disabled) {
    cursor: not-allowed;
  }

  &:hover ${ToggleThumb}, &:has(${Input}:focus-visible) ${ToggleThumb} {
    color: var(${UI.COLOR_TEXT});
    background: var(--thumb-hover);
  }

  &:hover:has(${Input}:checked) ${ToggleThumb}, &:has(${Input}:checked:focus-visible) ${ToggleThumb} {
    color: ${({ theme }) => theme.white};
    background: var(--thumb-hover-checked);
  }
`
