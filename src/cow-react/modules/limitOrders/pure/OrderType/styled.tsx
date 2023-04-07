import styled from 'styled-components/macro'
import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
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

export const LabelText = styled('span')`
  color: ${({ theme }) => theme.text1};
`

export const StyledMenuList = styled(MenuList)`
  background: ${({ theme }) => theme.bg1};
  z-index: 2;
  padding: 0.6rem;
  border-radius: 4px;
  min-width: 100%;
  right: 0;
  position: absolute;
  white-space: nowrap;
  text-align: left;
  opacity: 0.9;
`

export const StyledMenuItem = styled(MenuItem)`
  color: ${({ theme }) => theme.text1};
  font-size: 0.8rem;
  cursor: pointer;
`

export const StyledMenuHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 0;
`
