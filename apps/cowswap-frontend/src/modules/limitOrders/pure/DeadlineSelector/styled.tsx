import { UI } from '@cowprotocol/ui'

import { MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import { transparentize } from 'color2k'
import { X } from 'react-feather'
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
  background: none;
  border: 0;
  outline: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  cursor: pointer;
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

export const CustomInput = styled.input`
  display: flex;
  cursor: pointer;
  font-size: 21px;
  border-radius: 8px;
  width: 100%;
  border: 1px solid ${({ theme }) => transparentize(theme.text, 0.7)};
  color: inherit;
  padding: 4px 8px;
  outline: 0;
  background: var(${UI.COLOR_PAPER});

  &::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) => (theme.darkMode ? 'invert(1)' : 'invert(0)')};
  }

  &::-webkit-datetime-edit {
    color: inherit;
  }

  &::-webkit-datetime-edit[disabled] {
    color: ${({ theme }) => transparentize(theme.text, 0.7)};
  }
`

export const CustomLabel = styled.label`
  display: flex;
  flex-flow: column wrap;
  font-size: 15px;
  font-weight: 600;
  gap: 10px;
  width: 100%;
`

export const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  height: 100%;
  width: 100%;
  padding: 16px;
  min-height: 150px;
`

export const ModalHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;
  color: inherit;

  > h3 {
    font-size: 21px;
    margin: 0;
  }
`

export const ModalFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 32px 0 0;
  gap: 10px;

  > button {
    border-radius: 12px;
  }
`

export const ModalContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: center;
  padding: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
`

export const CloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: var(${UI.COLOR_TEXT});
  }
`
