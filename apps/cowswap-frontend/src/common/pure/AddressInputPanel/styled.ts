import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 16px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  z-index: 1;
  width: 100%;
  font-size: 14px;
`

export const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 0;
  color: inherit;
  background-color: var(${UI.COLOR_PAPER_DARKER});
`

export const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`

export const Input = styled.input<{ error?: boolean }>`
  font-size: 15px;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: none;
  transition: color 0.2s ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error }) => (error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  width: 100%;

  &&::placeholder {
    color: inherit;
    opacity: 0.5;
  }

  &:focus::placeholder {
    color: transparent;
  }

  padding: 0px;
  appearance: textfield;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export const DestinationChainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ValidationError = styled.div`
  color: var(${UI.COLOR_DANGER});
  font-size: 14px;
  margin-top: 8px;
`

export const StyledExplorerLink = styled.a`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-decoration: none;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
  font-size: 13px;

  &:hover {
    color: var(${UI.COLOR_TEXT});
    text-decoration: underline;
  }
`
