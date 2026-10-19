import { UI, font } from '@cowprotocol/ui'

import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import styled from 'styled-components/macro'

import { StyledToggleArrow } from 'common/pure/ToggleArrow'

export const Wrapper = styled.div`
  padding: 0;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
`

export const Label = styled.span`
  display: flex;
  align-self: center;
  justify-self: center;
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_SMALL_PLUS', 'medium')}
`

export const Value = styled.div`
  color: var(${UI.COLOR_TEXT_SECONDARY});
  ${font('FONT_SMALL_PLUS', 'medium')}
`

export const Current = styled(MenuButton)<{ $custom?: boolean }>`
  color: var(${UI.COLOR_TEXT_SECONDARY});
  font-size: ${({ $custom }) => ($custom ? '12px' : '13px')};
  line-height: ${({ $custom }) => ($custom ? 'inherit' : '18px')};
  letter-spacing: ${({ $custom }) => ($custom ? '-0.3px' : '0')};
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  width: auto;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
  }

  > span {
    display: inline-block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &[aria-expanded='true'] ${StyledToggleArrow} {
    transform: rotate(180deg);
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
