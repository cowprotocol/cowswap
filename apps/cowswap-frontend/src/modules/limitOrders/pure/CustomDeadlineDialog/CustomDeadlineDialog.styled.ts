import { Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const CustomInput = styled.input`
  --minHeight: 45px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 22px;
  font-weight: 500;
  border-radius: 16px;
  width: 100%;
  min-height: var(--minHeight);
  border: 1px solid transparent;
  color: inherit;
  padding: 10px 16px;
  background: var(${UI.COLOR_PAPER_DARKER});

  ${Media.upToSmall()} {
    font-size: 20px;
  }

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
