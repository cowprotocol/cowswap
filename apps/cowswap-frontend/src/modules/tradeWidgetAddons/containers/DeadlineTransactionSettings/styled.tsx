import { FancyButton, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Input = styled.input`
  font-size: 16px;
  outline: none;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 2rem;
  background: transparent;
  color: inherit;

  &:disabled {
    color: inherit;
    background-color: inherit;
  }

  &::placeholder {
    opacity: 0.5;
    color: inherit;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  text-align: right;
`

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 0;
`
