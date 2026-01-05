import { Media, TokenSymbol, UI } from '@cowprotocol/ui'

import DropDown from 'assets/images/dropdown.svg?react'
import styled, { css } from 'styled-components/macro'

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

const getButtonColors = ($noCurrencySelected: boolean): ReturnType<typeof css> => css`
  --button-bg: ${$noCurrencySelected ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER})`};
  --button-text: ${$noCurrencySelected ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT_PAPER})`};
  --button-bg-hover: ${$noCurrencySelected ? `var(${UI.COLOR_PRIMARY_LIGHTER})` : `var(${UI.COLOR_PRIMARY})`};
  --button-text-hover: var(${UI.COLOR_BUTTON_TEXT});
`

const getHoverColor = (readonlyMode: boolean): string => {
  if (readonlyMode) return `var(${UI.COLOR_TEXT_PAPER})`
  return `var(${UI.COLOR_BUTTON_TEXT})`
}

export const CurrencySelectWrapper = styled.button<{
  isLoading: boolean
  $noCurrencySelected: boolean
  readonlyMode: boolean
  displayTokenName: boolean
  displayChainName: boolean
}>`
  ${({ $noCurrencySelected }) => getButtonColors($noCurrencySelected)}

  --min-height: 35px;
  --min-width: 190px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ readonlyMode }) => (readonlyMode ? 'default' : 'pointer')};
  gap: 6px;
  border: 0;
  outline: none;
  background: var(--button-bg);
  color: var(--button-text);
  box-shadow: var(${UI.BOX_SHADOW_2});
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  max-width: var(--max-width);
  min-height: var(--min-height);
  padding: ${({ displayTokenName, displayChainName, readonlyMode }) => {
    const hasExtraContent = displayTokenName || displayChainName
    const paddingRight = readonlyMode || hasExtraContent ? '10px' : '5px'
    return hasExtraContent ? `5px ${paddingRight} 5px 5px` : '5px'
  }};

  ${StyledTokenSymbol} {
    color: var(--button-text);
  }

  ${ArrowDown} > path {
    stroke: ${({ $noCurrencySelected }) =>
      $noCurrencySelected ? 'var(--button-text)' : `var(${UI.COLOR_TEXT_OPACITY_50})`};
  }

  &:hover {
    ${({ readonlyMode }) => !readonlyMode && 'background: var(--button-bg-hover);'}

    ${StyledTokenSymbol},
    ${TokenSubText} {
      color: ${({ readonlyMode }) => getHoverColor(readonlyMode)};
    }

    ${ArrowDown} > path {
      stroke: ${({ readonlyMode }) => getHoverColor(readonlyMode)};
    }
  }
`
