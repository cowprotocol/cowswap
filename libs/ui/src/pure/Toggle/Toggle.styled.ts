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

export const Wrapper = styled.div<{ $bgColor?: string; $inactiveBgColor?: string }>`
  --height: 24px;
  --offset: 4px;

  --track-inactive: ${({ $inactiveBgColor }) => $inactiveBgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  --track-active: var(${UI.COLOR_PRIMARY_OPACITY_25});

  --thumb-inactive: var(${UI.COLOR_PRIMARY_OPACITY_50});
  --thumb-active: ${({ $bgColor }) => $bgColor || `var(${UI.COLOR_PRIMARY})`};

  position: relative;
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

  ${Input}:hover + &,
  ${Input}:focus-visible + & {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PRIMARY});
  }

  ${Input}:checked + & {
    background: var(--thumb-active);
    color: var(${UI.COLOR_BUTTON_TEXT});
    transform: translateX(calc(var(--height) * 1.618 - var(--height)));
  }

  ${Input}:checked + &:hover,
  ${Input}:checked + &:focus-visible {
    color: ${({ theme }) => theme.white};
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }

  ${Input}:disabled + & {
    opacity: 0.5;
  }
`
