import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
`

export const LabelText = styled.span`
  color: ${({ theme }) => theme.text1};
  transition: color 0.15s ease-in-out;
`

export const StyledSVG = styled(SVG)`
  --size: 10px;
  margin: 0 0 0 5px;
  width: var(--size);
  height: var(--size);

  > path {
    fill: ${({ theme }) => theme.text1};
    transition: fill 0.15s ease-in-out;
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
  background: ${({ theme }) => theme.bg3};
  padding: 4px 10px;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => theme.bg2};

    > ${LabelText}, > ${StyledSVG} > path {
      fill: ${({ theme }) => theme.white};
      color: ${({ theme }) => theme.white};
    }
  }
`

export const StyledMenuList = styled(MenuList)`
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
  background: ${({ theme }) => theme.bg1};
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
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 400;
  transition: background 0.1s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.white};
  }
`
