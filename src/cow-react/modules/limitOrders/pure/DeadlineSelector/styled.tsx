import styled from 'styled-components/macro'
import { lighten, transparentize } from 'polished'
import { MenuItem, MenuList, MenuButton } from '@reach/menu-button'

export const Wrapper = styled.div`
  padding: 0;
  margin: 0;
  min-height: 24px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
  font-size: 13px;
`

export const Label = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const Current = styled(MenuButton)`
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  outline: none;
  margin: 0;
  white-space: nowrap;
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  padding: 1px 3px 1px 6px;
  background: ${({ theme }) => theme.grey1};
  border-radius: 10px;
  font-weight: 400;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${({ theme }) => lighten(0.02, theme.grey1)};
    text-decoration: none;
  }

  > span {
    display: inline-block;
  }

  > svg {
    margin: 0 0 0 auto;
  }
`

export const ListWrapper = styled(MenuList)`
  display: block;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  outline: none;
  list-style: none;
  position: relative;
  z-index: 2;
  min-width: 120px;
`

export const ListItem = styled(MenuItem)`
  color: ${({ theme }) => theme.text1};
  background: none;
  border: 0;
  outline: none;
  margin: 0 0 10px 0;
  padding: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  position: relative;

  :hover {
    text-decoration: underline;
  }
`

export const CustomInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  ::-webkit-calendar-picker-indicator {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`
