import { UI, Badge } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TagGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${Badge} {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 14px;
  }
`

export const LabelAffordances = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FormActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FormActionButton = styled.button<{ variant: 'outline' | 'filled' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: ${({ variant }) => (variant === 'filled' ? `var(${UI.COLOR_INFO_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  background: ${({ variant }) => (variant === 'filled' ? `var(${UI.COLOR_INFO_BG})` : `var(${UI.COLOR_PAPER})`)};
  border: ${({ variant }) => (variant === 'outline' ? `1px solid var(${UI.COLOR_BORDER})` : 'none')};
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`

export const FormActionDanger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: 600;
  color: var(${UI.COLOR_DANGER_TEXT});
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`

export const InputWrapper = styled.div<{
  hasError?: boolean
  disabled?: boolean
  isEditing?: boolean
  isLinked?: boolean
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ hasError }) => (hasError ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ hasError, isEditing, isLinked }) =>
    hasError
      ? `var(${UI.COLOR_DANGER_BG})`
      : isLinked
        ? `var(${UI.COLOR_INFO_BG})`
        : isEditing
          ? `var(${UI.COLOR_PAPER_DARKER})`
          : `var(${UI.COLOR_PAPER})`};
  color: ${({ hasError, isLinked }) =>
    hasError ? `var(${UI.COLOR_DANGER_TEXT})` : isLinked ? `var(${UI.COLOR_INFO_TEXT})` : `var(${UI.COLOR_TEXT})`};
  border-radius: 9px;
  padding: 12px 14px;
  transition: border 0.2s ease;
  min-height: 58px;

  &:focus-within {
    border-color: ${({ hasError }) => (hasError ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_PRIMARY_LIGHTER})`)};
  }
`

export const StyledInput = styled.input<{ disabled?: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
  font-family: var(${UI.FONT_FAMILY_MONO});
  padding: 0;
  margin: 0;
  outline: none;
  caret-color: var(${UI.COLOR_PRIMARY});

  &:disabled {
    color: inherit;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }
`

export const TrailingIcon = styled.div<{ kind: 'error' | 'lock' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: ${({ kind }) =>
    kind === 'error'
      ? `var(${UI.COLOR_DANGER_TEXT})`
      : kind === 'lock'
        ? `var(${UI.COLOR_INFO_TEXT})`
        : `var(${UI.COLOR_TEXT_OPACITY_70})`};

  svg {
    width: 18px;
    height: 18px;
    fill: ${({ kind }) => (kind === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : 'currentColor')};
  }

  svg > path {
    fill: ${({ kind }) => (kind === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : 'currentColor')};
  }
`
