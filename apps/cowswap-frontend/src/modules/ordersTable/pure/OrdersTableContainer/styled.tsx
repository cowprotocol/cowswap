import { Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { RateWrapper } from 'common/pure/RateInfo'

export const TableHeader = styled.div<{ isHistoryTab: boolean; isRowSelectable: boolean }>`
  --height: 51px;
  --checkboxSize: 16px;
  --checkBoxBorderRadius: 3px;
  display: grid;
  gap: 14px;
  grid-template-columns: ${({ isHistoryTab, isRowSelectable }) =>
    !isHistoryTab
      ? `${isRowSelectable ? 'var(--checkboxSize)' : ''} minmax(200px,2.5fr) minmax(110px,1fr) minmax(70px,0.5fr) minmax(110px,1fr) minmax(110px,1fr) minmax(70px,0.5fr) minmax(80px,0.8fr) 40px`
      : `minmax(200px, 2.5fr)  
         repeat(3, minmax(110px, 1fr))
         minmax(80px, 0.8fr)   
         minmax(100px, 1fr)  
         40px               `};
  grid-template-rows: minmax(var(--height), 1fr);
  align-items: center;
  border: none;
  padding: 0 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-top: none;
  border-right: none;
  border-left: none;
  border-image: initial;
  border-bottom: 1px solid var(--cow-color-text-opacity-10);

  ${Media.upToSmall()} {
    --checkboxSize: 24px;
    --checkBoxBorderRadius: 6px;
  }
`

export const TableRow = styled(TableHeader)<{ isChildOrder?: boolean }>`
  background: ${({ isChildOrder }) => (isChildOrder ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: grid;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  > div:first-child {
    margin: 0;

    &::before {
      display: ${({ isChildOrder }) => (isChildOrder ? 'inline-block' : 'none')};
      color: ${({ theme }) => transparentize(theme.text, 0.5)};
      content: '↳';
      text-decoration: none !important;
    }
  }

  ${RateWrapper} {
    text-align: left;
  }
`

export const CheckboxCheckmark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background: transparent;
  width: 100%;
  height: 100%;
  height: var(--checkboxSize);
  width: var(--checkboxSize);
  top: -1px;
  bottom: 0;

  &::after {
    content: '';
    position: absolute;
    display: none;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 31%;
    height: 66%;
    border: solid var(${UI.COLOR_BUTTON_TEXT});
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    transition: border-color var(${UI.ANIMATION_DURATION}) ease-in-out;

    ${Media.upToSmall()} {
      border-width: 0 3px 3px 0;
    }
  }
`

export const TableRowCheckbox = styled.input`
  width: var(--checkboxSize);
  height: var(--checkboxSize);
  background: transparent;
  border: 2px solid var(${UI.COLOR_TEXT});
  border-radius: var(--checkBoxBorderRadius);
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
    border-color var(${UI.ANIMATION_DURATION}) ease-in-out;
  appearance: none;
  margin: 0;
  outline: 0;
  opacity: 0.5;
  z-index: 5;

  &:checked {
    border-color: var(${UI.COLOR_PRIMARY});
    background: var(${UI.COLOR_PRIMARY});
    opacity: 1;
    z-index: 6;
  }

  &:checked + ${CheckboxCheckmark}::after {
    display: block;
    z-index: 6;
  }

  &:indeterminate {
    background: var(${UI.COLOR_PRIMARY});
    border-color: var(${UI.COLOR_PRIMARY});
    z-index: 6;
  }

  &:indeterminate + ${CheckboxCheckmark}::after {
    display: block;
    border: solid var(${UI.COLOR_BUTTON_TEXT});
    border-width: 2px 0 0 0;
    top: calc(50% + 3px);
    transform: none;
    z-index: 6;

    ${Media.upToSmall()} {
      top: calc(50% + 4px);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.1;
    background: var(${UI.COLOR_TEXT});
    z-index: 6;
  }
`

export const TableRowCheckboxWrapper = styled.label`
  width: var(--checkboxSize);
  height: var(--checkboxSize);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;

  &:hover > ${TableRowCheckbox}:not(:checked):not([disabled]) {
    background: var(${UI.COLOR_PRIMARY});
    border-color: var(${UI.COLOR_PRIMARY});
    opacity: 0.5;
    z-index: 6;

    + ${CheckboxCheckmark}::after {
      display: block;
      border-color: var(${UI.COLOR_BUTTON_TEXT});
      z-index: 6;
    }
  }
`
