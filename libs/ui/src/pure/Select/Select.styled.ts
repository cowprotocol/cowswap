import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

import type { SelectHeight, SelectVariant } from './Select.types'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const SelectButton = styled.button<{
  $variant: SelectVariant
  $height?: SelectHeight
}>`
  field-sizing: content;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
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
  font-family: inherit;

  ${({ $variant }) =>
    $variant === 'text' &&
    css`
      background: transparent;
      border: none;
      padding: 0;
      font-size: inherit;
      font-weight: inherit;
      border-radius: 0;
    `}
`

export const ButtonLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ChevronIconWrapper = styled.span<{ $isOpen: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: none;
`

export const DropdownContent = styled.div`
  width: 100%;
  max-height: min(320px, 50vh);
  overflow-y: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: 14px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  padding: 10px;
`

export const DropdownItem = styled.div<{ $isActive: boolean; $isDimmed: boolean }>`
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  opacity: ${({ $isDimmed }) => ($isDimmed ? 0.35 : 1)};
  transition:
    opacity var(${UI.ANIMATION_DURATION}) ease,
    background-color var(${UI.ANIMATION_DURATION}) ease;
  background: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PRIMARY_OPACITY_10})` : 'transparent')};
`
