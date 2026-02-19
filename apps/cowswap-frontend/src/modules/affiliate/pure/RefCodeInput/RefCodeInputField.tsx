import { InputHTMLAttributes, ReactNode } from 'react'

import { Font, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { REF_CODE_MAX_LENGTH } from '../../config/affiliateProgram.const'

export interface RefCodeInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  compactSize?: boolean
}

export function RefCodeInputField({ compactSize = false, ...rest }: RefCodeInputFieldProps): ReactNode {
  return (
    <StyledInputField
      placeholder={t`ENTER CODE`}
      maxLength={REF_CODE_MAX_LENGTH}
      compactSize={compactSize}
      autoComplete="off"
      spellCheck={false}
      {...rest}
    />
  )
}

const StyledInputField = styled.input<{ disabled?: boolean; compactSize?: boolean }>`
  flex: 1;
  border: none;
  background: transparent;
  color: inherit;
  position: relative;
  width: 100%;
  min-width: 0;
  z-index: 1;
  font-size: ${({ compactSize }) => (compactSize ? '16px' : '20px')};
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
  font-family: ${Font.familyMono};
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

  ${({ disabled }) => disabled && 'cursor: not-allowed;'}
`
