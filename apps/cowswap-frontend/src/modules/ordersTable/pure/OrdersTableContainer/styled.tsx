import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
`

export const TableHeader = styled.div<{ isHistoryTab: boolean; isRowSelectable: boolean; isTwapTable?: boolean }>`
  --header-height: 26px;
  --row-height: 41px;
  --checkboxSize: 16px;
  --checkBoxBorderRadius: 3px;
  display: grid;
  gap: 14px;
  grid-template-columns: ${({ isHistoryTab, isRowSelectable, isTwapTable }) => {
    const checkboxColumn = isRowSelectable ? 'var(--checkboxSize)' : ''

    // TWAP table layout - applies to both history and non-history tabs
    if (isTwapTable) {
      if (isHistoryTab) {
        return `minmax(200px, 2.5fr)
                repeat(4, minmax(110px, 1fr))
                minmax(106px,112px)
                minmax(120px, 1fr)
                minmax(106px, 0.8fr)
                24px`
      }
      return `${checkboxColumn} minmax(160px,2fr) minmax(120px,1fr) minmax(140px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(106px,112px) minmax(120px,1fr) minmax(106px, 0.8fr) 24px`
    }

    // Default layout for history tab
    if (isHistoryTab) {
      return `minmax(200px, 2.5fr)
              repeat(4, minmax(110px, 1fr))
              minmax(106px,112px)
              minmax(106px, 0.8fr)
              24px`
    }

    // Default/Limit orders layout
    return `${checkboxColumn} minmax(160px,2fr) minmax(120px,1fr) minmax(140px,1fr) minmax(120px,1fr) minmax(120px,1fr) minmax(106px,112px) minmax(106px, 0.8fr) 24px`
  }};
  grid-template-rows: minmax(var(--header-height), 1fr);
  align-items: center;
  border: none;
  padding: 5px 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-top: none;
  border-right: none;
  border-left: none;
  border-image: initial;
  border-bottom: 1px solid var(--cow-color-text-opacity-10);
  width: fit-content;
  min-width: 100%;

  ${Media.upToSmall()} {
    --checkboxSize: 24px;
  }
`

export const TableRow = styled(TableHeader)<{
  isChildOrder?: boolean
  isHistoryTab: boolean
  isRowSelectable: boolean
  isTwapTable?: boolean
  isExpanded?: boolean
}>`
  grid-template-rows: minmax(var(--row-height), 1fr);
  background: ${({ isChildOrder, isExpanded }) =>
    isExpanded && !isChildOrder
      ? `var(${UI.COLOR_INFO_BG})`
      : isChildOrder
        ? `var(${UI.COLOR_PAPER_DARKER})`
        : 'transparent'};
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: grid;

  &:hover {
    background: ${({ isExpanded, isChildOrder }) =>
      isExpanded && !isChildOrder ? `var(${UI.COLOR_INFO_BG})` : `var(${UI.COLOR_PAPER_DARKER})`};
  }

  > div:first-child {
    margin-left: ${({ isChildOrder }) => (isChildOrder ? '5px' : '')};

    &::before {
      display: ${({ isChildOrder }) => (isChildOrder ? 'inline-block' : 'none')};
      color: inherit;
      content: '↳';
      text-decoration: none !important;
      opacity: 0.6;
    }
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
