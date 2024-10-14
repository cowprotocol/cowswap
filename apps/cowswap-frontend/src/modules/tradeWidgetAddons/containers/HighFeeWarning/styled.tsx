import { Media, UI } from '@cowprotocol/ui'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

import { HIGH_TIER_FEE, LOW_TIER_FEE, MEDIUM_TIER_FEE } from './consts'

interface HighFeeContainerProps {
  level?: number
  isDarkMode?: boolean
}

// TODO: refactor these styles
export const AuxInformationContainer = styled.div<{
  margin?: string
  borderColor?: string
  borderWidth?: string
  hideInput: boolean
  disabled?: boolean
  showAux?: boolean
}>`
  border: 1px solid ${({ hideInput }) => (hideInput ? ' transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
  background-color: var(${UI.COLOR_PAPER});
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};

  :focus,
  :hover {
    border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.background)};
  }

  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
      :focus,
      :hover {
        border: 1px solid ${hideInput ? ' transparent' : theme.background};
      }
    `}

  margin: ${({ margin = '0 auto' }) => margin};
  border-radius: 0 0 15px 15px;
  border: 2px solid var(${UI.COLOR_PAPER_DARKER});

  &:hover {
    border: 2px solid var(${UI.COLOR_PAPER_DARKER});
  }

  ${Media.upToSmall()} {
    height: auto;
    flex-flow: column wrap;
    justify-content: flex-end;
    align-items: flex-end;
  }
`

export const WarningCheckboxContainer = styled.label`
  display: flex;
  width: 100%;
  font-weight: bold;
  gap: 2px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  padding: 0;
  margin: 10px auto;
  cursor: pointer;

  > input {
    cursor: pointer;
    margin: 1px 4px 0 0;
  }
`

export const WarningContainer = styled(AuxInformationContainer).attrs((props) => ({
  ...props,
  hideInput: true,
}))<HighFeeContainerProps>`
  --warningColor: ${({ theme, level }) =>
    level === HIGH_TIER_FEE
      ? theme.danger
      : level === MEDIUM_TIER_FEE
        ? theme.warning
        : LOW_TIER_FEE
          ? theme.alert
          : theme.info};
  color: inherit;
  padding: 16px;
  width: 100%;
  border-radius: 16px;
  border: 0;
  margin: ${({ margin = '0 auto' }) => margin};
  position: relative;
  z-index: 1;

  &:hover {
    border: 0;
  }

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: inherit;
    background: var(--warningColor);
    opacity: ${({ isDarkMode }) => (isDarkMode ? 0.2 : 0.15)};
    z-index: -1;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;

    > svg:first-child {
      stroke: var(--warningColor);
    }
  }
`

export const ErrorStyledInfoIcon = styled(Info)`
  opacity: 0.6;
  line-height: 0;
  vertical-align: middle;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
  color: ${({ theme }) => (theme.darkMode ? '#FFCA4A' : '#564D00')};
`
