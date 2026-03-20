import styled, { css } from 'styled-components/macro'

import { SelectHeight, SelectVariant } from './Select.pure'

import { UI } from '../../enum'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: red;
`

export const SelectInput = styled.input<{
  $variant: SelectVariant
  $height?: SelectHeight
}>`
  field-sizing: content;
  width: 100%;
  padding: 10px ${({ $height }) => ($height || 32) + 8}px 10px 10px;
  border-radius: 14px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  outline: none;
  appearance: none;
  text-align: left;

  ${({ $variant }) =>
    $variant === 'text' &&
    css`
      background: transparent;
      border: none;
      padding: 0;
      padding-right: 24px;
      font-size: inherit;
      font-weight: inherit;
      // cursor: pointer;
      outline: none;
      border-radius: 0;
    `}
`

export const ChevronIconWrapper = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  aspect-ratio: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: inherit;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
`

export const DropdownContent = styled.div`¡
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 14px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  padding: 10px;
`

export const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`
