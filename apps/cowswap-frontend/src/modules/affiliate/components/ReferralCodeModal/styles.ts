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
  padding: 10px 10px 0;
  gap: 10px;
`

export const Illustration = styled.img`
  --size: 100px;
  align-self: center;
  width: auto;
  height: var(--size);
  display: block;
  object-fit: contain;
  margin: 0 0 24px;
`

export const Title = styled.h2`
  margin: 0 auto 16px;
  width: 100%;
  max-width: 260px;
  padding: 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  text-align: center;
`

export const Subtitle = styled.p`
  margin: 0 auto 24px;
  width: 100%;
  max-width: 80%;
  font-size: 15px;
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
  padding: 0 0 0 8px;
  width: 100%;
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
  border-radius: 9px;
  background: var(${UI.COLOR_NEUTRAL_98});
  color: var(${UI.COLOR_TEXT});
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px 10px;
`

export const HelperText = styled.div`
  text-align: center;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 6px 0 10px;
`

export const InlineAlert = styled(InlineBanner)`
  border-radius: 9px;
  padding: 12px 16px;
`

export const ErrorInline = styled(InlineBanner)`
  border-radius: 9px;
  padding: 12px 16px;
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
