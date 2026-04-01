import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const InputWrapper = styled.div<{ $hasLeftSlot: boolean; $hasError: boolean }>`
  position: relative;
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex: 1;
  // TODO: This is currently not used because the validation logic for slippage and deadline are not good
  // (e.g. <number><randomText>) is considered valid, for example).
  // background: var(${({ $hasError }) => ($hasError ? UI.COLOR_DANGER_BG : UI.COLOR_PAPER_DARKER)});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 0;
  text-align: right;
  border-radius: 16px;
  min-height: 38px; // This matches the dropdowns' height inside the settings modals.
  font-size: 18px;
  padding-right: 16px;
  padding-left: ${({ $hasLeftSlot }) => ($hasLeftSlot ? '0' : '16px')};
`

export const Input = styled.input`
  font-size: 16px;
  outline: none;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  flex: 1;

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

export const Unit = styled.span`
  align-self: center;
  font-size: 14px;
  color: inherit;
`
