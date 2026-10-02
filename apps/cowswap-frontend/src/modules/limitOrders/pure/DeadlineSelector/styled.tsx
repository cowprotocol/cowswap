import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  color: inherit;
  padding: 0;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  font-size: 13px;
  font-weight: inherit;
`

export const Label = styled.span`
  display: flex;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  align-self: center;
  justify-self: center;
`

export const Current = styled(MenuButton)<{ $custom?: boolean }>`
  color: inherit;
  font-size: ${({ $custom }) => ($custom ? '12px' : '100%')};
  letter-spacing: ${({ $custom }) => ($custom ? '-0.3px' : '0')};
  font-weight: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
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
  background: var(${UI.COLOR_PAPER});
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
  color: inherit;
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
