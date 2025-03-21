import DropDown from '@cowprotocol/assets/images/dropdown.svg?react'
import { Media, TokenSymbol, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TokenSubText = styled.div`
  font-size: 12px;
  line-height: 1;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
`

export const CurrencySymbol = styled.div<{ $noCurrencySelected: boolean }>`
  display: flex;
  flex-flow: column wrap;
  gap: 3px;
  font-size: 19px;
  font-weight: 500;
  line-height: 1;
  text-align: left;
  color: inherit;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${Media.upToSmall()} {
    font-size: 16px;
    word-break: break-word;
    white-space: normal;
    text-align: left;
  }
`

export const ArrowDown = styled((props) => <DropDown {...props} />)<{ $noCurrencySelected?: boolean }>`
  --arrow-width: 12px;
  --arrow-height: 7px;
  margin: 0 3px;
  width: var(--arrow-width);
  height: var(--arrow-height);
  min-width: var(--arrow-width);
  min-height: var(--arrow-height);

  > path {
    stroke: var(${UI.COLOR_TEXT_OPACITY_50});
    stroke-width: 2;
    transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  ${Media.upToSmall()} {
    margin-left: auto;
  }
`

export const StyledTokenSymbol = styled(TokenSymbol)<{ displayTokenName: boolean; displayChainName: boolean }>`
  font-size: ${({ displayTokenName }) => (displayTokenName ? '15px' : null)};
  color: var(${UI.COLOR_TEXT_PAPER});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
`

export const CurrencySelectWrapper = styled.button<{
  isLoading: boolean
  $noCurrencySelected: boolean
  readonlyMode: boolean
  displayTokenName: boolean
  displayChainName: boolean
}>`
  --min-height: 35px;
  --min-width: 190px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ readonlyMode }) => (readonlyMode ? '' : 'pointer')};
  gap: 6px;
  border: 0;
  outline: none;
  background: ${({ $noCurrencySelected }) =>
    $noCurrencySelected ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER})`};
  color: ${({ $noCurrencySelected }) =>
    $noCurrencySelected ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT_PAPER})`};
  box-shadow: var(${UI.BOX_SHADOW_2});
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  ${({ readonlyMode }) => (readonlyMode ? 'padding-right: 10px;' : '')}
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  max-width: var(--max-width);
  min-height: var(--min-height);
  padding: ${({ displayTokenName, displayChainName }) =>
    displayTokenName || displayChainName ? '5px 10px 5px 5px' : '5px'};

  ${StyledTokenSymbol} {
    color: ${({ $noCurrencySelected }) =>
      $noCurrencySelected ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT_PAPER})`};
  }

  &:hover {
    background: ${({ readonlyMode, $noCurrencySelected }) =>
      readonlyMode ? '' : $noCurrencySelected ? `var(${UI.COLOR_PRIMARY_LIGHTER});` : `var(${UI.COLOR_PRIMARY});`};

    ${TokenSubText}, ${StyledTokenSymbol}, ${CurrencySymbol} {
      color: var(${UI.COLOR_BUTTON_TEXT});
    }

    ${ArrowDown} > path {
      stroke: ${({ $noCurrencySelected }) =>
        $noCurrencySelected ? `var(${UI.COLOR_TEXT_OPACITY_50})` : `var(${UI.COLOR_BUTTON_TEXT})`};
    }
  }
`
