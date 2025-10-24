import { UI, Badge, InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
`

export const Illustration = styled.div`
  align-self: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(${UI.COLOR_NEUTRAL_98});
  border: 1px dashed var(${UI.COLOR_NEUTRAL_80});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

export const Subtitle = styled.p`
  margin: 0;
  font-size: var(${UI.FONT_SIZE_NORMAL});
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;

  a {
    color: var(${UI.COLOR_LINK});
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Label = styled.label`
  font-size: var(${UI.FONT_SIZE_NORMAL});
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

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

export const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_LINK});
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;

  &:hover {
    opacity: 0.8;
  }
`

export const InputWrapper = styled.div<{ hasError?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid ${({ hasError }) => (hasError ? `var(${UI.COLOR_ALERT})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ disabled }) => (disabled ? `var(${UI.COLOR_NEUTRAL_98})` : `var(${UI.COLOR_PAPER})`)};
  border-radius: 16px;
  padding: 12px 16px;
  transition: border 0.2s ease;

  &:focus-within {
    border-color: ${({ hasError }) => (hasError ? `var(${UI.COLOR_ALERT})` : `var(${UI.COLOR_PRIMARY_LIGHTER})`)};
  }
`

export const StyledInput = styled.input<{ disabled?: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'studiofeixenmono', monospace;
  padding: 0;
  margin: 0;
  outline: none;
  caret-color: var(${UI.COLOR_PRIMARY});

  &:disabled {
    color: var(${UI.COLOR_TEXT_OPACITY_60});
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }
`

export const TrailingActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const InlineAction = styled.button<{ emphasis?: 'normal' | 'danger' }>`
  border: none;
  background: none;
  color: ${({ emphasis }) => (emphasis === 'danger' ? `var(${UI.COLOR_ALERT})` : `var(${UI.COLOR_LINK})`)};
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const StatusMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const SpinnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(${UI.COLOR_NEUTRAL_98});
  color: var(${UI.COLOR_TEXT});
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px 24px;
`

export const HelperText = styled.div`
  text-align: center;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const InlineAlert = styled(InlineBanner)`
  border-radius: 12px;
  padding: 12px 16px;
`

export const ErrorInline = styled(InlineBanner)`
  border-radius: 12px;
  padding: 12px 16px;
`

export const LinkedLock = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TrailingIcon = styled.div<{ kind: 'error' | 'lock' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ kind }) => (kind === 'error' ? `var(${UI.COLOR_ALERT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
`
