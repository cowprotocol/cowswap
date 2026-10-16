import { ButtonOutlined, font, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

const shortcutStyles = css`
  ${font('FONT_SMALL_PLUS', 'medium')}
  height: 28px;
  min-height: 28px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
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
  padding: 3px 10px;
  gap: 0;

  &:hover {
    border: 2px solid transparent;
  }

  &[aria-pressed='true'] {
    border-color: var(${UI.COLOR_PRIMARY});
    background: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  &:disabled:hover {
    background: var(${UI.COLOR_PAPER});
  }
`

export const CustomPercentage = styled.div<{ $selected: boolean; $invalid: boolean }>`
  ${shortcutStyles}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  flex-shrink: 0;
  padding: 3px 7px;
  border-color: ${({ $selected, $invalid }) =>
    $invalid ? `var(${UI.COLOR_DANGER})` : $selected ? `var(${UI.COLOR_PRIMARY})` : 'transparent'};
  color: ${({ $invalid }) => `var(${$invalid ? UI.COLOR_DANGER : UI.COLOR_TEXT})`};

  &:focus-within {
    border-color: ${({ $invalid }) => `var(${$invalid ? UI.COLOR_DANGER : UI.COLOR_PRIMARY})`};
  }
`

export const CustomInput = styled(Input)`
  ${font('FONT_SMALL_PLUS', 'medium')}
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
  color: inherit;
  outline: none;
  background: transparent;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`
