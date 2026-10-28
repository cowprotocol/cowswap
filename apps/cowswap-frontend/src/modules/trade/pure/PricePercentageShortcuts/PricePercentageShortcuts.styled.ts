import { ButtonOutlined, font, Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

const shortcutStyles = css`
  ${font('FONT_SMALL_PLUS', 'medium')}
  padding: 3px 7px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});

  &:not(:disabled):hover {
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }

  ${Media.upToExtraSmall()} {
    ${font('FONT_MEDIUM', 'medium')}
    padding: 5px 12px;
  }
`

export const Shortcuts = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 0 16px;
`

export const Shortcut = styled(ButtonOutlined)`
  ${shortcutStyles}
  min-width: 60px;
  gap: 0;

  &:hover,
  &:focus,
  &:active {
    box-shadow: none;
  }

  &:hover {
    border: 2px solid transparent;
  }

  &:disabled:hover {
    background: var(${UI.COLOR_PAPER});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  &[aria-pressed='true'] {
    border-color: var(${UI.COLOR_PRIMARY});
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }
`

export const CustomPercentage = styled.div<{ $selected: boolean; $invalid: boolean }>`
  ${font('FONT_SMALL_PLUS', 'medium')}
  position: relative;
  width: 84px;
  flex-shrink: 0;

  > input {
    border-color: ${({ $selected, $invalid }) =>
      $invalid ? `var(${UI.COLOR_DANGER})` : $selected ? `var(${UI.COLOR_PRIMARY})` : 'transparent'};
    background: ${({ $selected }) => `var(${$selected ? UI.COLOR_PRIMARY_OPACITY_10 : UI.COLOR_PAPER})`};
    color: ${({ $invalid }) => `var(${$invalid ? UI.COLOR_DANGER : UI.COLOR_TEXT})`};
  }

  &:focus-within > input {
    border-color: ${({ $invalid }) => `var(${$invalid ? UI.COLOR_DANGER : UI.COLOR_PRIMARY})`};
  }

  > span {
    position: absolute;
    top: 50%;
    right: 9px;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${({ $invalid }) => `var(${$invalid ? UI.COLOR_DANGER : UI.COLOR_TEXT})`};
  }

  ${Media.upToExtraSmall()} {
    ${font('FONT_MEDIUM', 'medium')}
    width: 110px;

    > span {
      right: 14px;
    }
  }
`

export const CustomInput = styled(Input)`
  ${shortcutStyles}
  width: 100%;
  min-width: 0;
  text-align: center;
  outline: none;

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  &:not(:placeholder-shown) {
    padding-right: 22px;

    ${Media.upToExtraSmall()} {
      padding-right: 32px;
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`
