import styled from 'styled-components/macro'
import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { transparentize } from 'polished'
import SVG from 'react-inlinesvg'

export const Wrapper = styled.div`
  position: relative;
`

export const StyledMenuButton = styled(MenuButton)`
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  position: relative;

  cursor: pointer;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.bg3};
  padding: 4px 10px;
  border-radius: 8px;
`

export const StyledSVG = styled(SVG)`
  stroke: ${({ theme }) => theme.text1};
  margin-left: 5px;
  width: 8px;
  transition: all 0.15s ease-in;

  &.expanded {
    transform: rotate(180deg);
  }
`

export const LabelText = styled.span`
  color: ${({ theme }) => theme.text1};
`

export const StyledMenuList = styled(MenuList)`
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
  background: ${({ theme }) => theme.bg1};
  border-radius: 8px;
  z-index: 2;
  padding: 0.6rem 0.8rem;
  min-width: 100%;
  right: 0;
  position: absolute;
  white-space: nowrap;
  text-align: left;
`

export const StyledMenuItem = styled(MenuItem)`
  color: ${({ theme }) => theme.text1};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 0;
  font-weight: 400;
`
