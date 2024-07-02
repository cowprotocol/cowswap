import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
`

export const LabelText = styled.span`
  color: inherit;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
  font-size: inherit;
`

export const StyledSVG = styled(SVG)`
  --size: 10px;
  margin: 0 0 0 5px;
  width: var(--size);
  height: var(--size);

  > path {
    fill: var(${UI.COLOR_TEXT});
    transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &.expanded {
    transform: rotate(180deg);
  }
`

export const StyledMenuButton = styled(MenuButton)`
  background: none;
  border: none;
  outline: none;
  margin: 0;
  position: relative;
  cursor: ${({ disabled }) => (disabled ? 'inherit' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? '0.7' : '1')};
  display: flex;
  align-items: center;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: inherit;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});

    > ${LabelText}, > ${StyledSVG} > path {
      fill: currentColor;
      color: currentColor;
    }
  }
`

export const StyledMenuList = styled(MenuList)`
  box-shadow: none;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 8px;
  z-index: 2;
  min-width: 100%;
  right: 0;
  position: absolute;
  white-space: nowrap;
  text-align: left;
  padding: 6px;
`

export const StyledMenuItem = styled(MenuItem)`
  padding: 6px 12px;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 400;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }
`
