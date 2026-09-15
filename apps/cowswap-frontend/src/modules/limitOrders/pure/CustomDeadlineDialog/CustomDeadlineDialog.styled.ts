import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const CustomInput = styled.input`
  display: flex;
  cursor: pointer;
  font-size: 21px;
  border-radius: 8px;
  width: 100%;
  border: 1px solid ${({ theme }) => transparentize(theme.text, 0.7)};
  color: inherit;
  padding: 4px 8px;
  background: var(${UI.COLOR_PAPER});

  &::-webkit-calendar-picker-indicator {
    filter: ${({ theme }) => (theme.darkMode ? 'invert(1)' : 'invert(0)')};
  }

  &::-webkit-datetime-edit {
    color: inherit;
  }

  &::-webkit-datetime-edit[disabled] {
    color: ${({ theme }) => transparentize(theme.text, 0.7)};
  }
`

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 14px;
`
