import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Instruction = styled.p`
  line-height: 1.4;
  margin: 0 0 1rem;
`

export const Warning = styled.strong`
  color: inherit;
`

export const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 0 0 1rem;
  padding: 10px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`
