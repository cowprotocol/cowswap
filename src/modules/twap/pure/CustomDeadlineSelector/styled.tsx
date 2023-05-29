import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { ButtonSecondary } from 'legacy/components/Button'

import { NumericalInput } from '../../../trade/pure/TradeNumberInput'

export const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  height: 100%;
  width: 100%;
  padding: 16px;
  min-height: 150px;
`

export const ModalHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;

  > h3 {
    font-size: 21px;
    margin: 0;
  }
`

export const ModalFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 15px 0 0;
  gap: 10px;

  > button {
    border-radius: 12px;
  }
`

export const ModalContent = styled.div`
  display: flex;
  grid-gap: 6px;
`

export const CloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const CancelButton = styled(ButtonSecondary)`
  background: transparent;
  color: ${({ theme }) => theme.text1};
  border: 1px solid ${({ theme }) => theme.text1};

  :hover {
    background: transparent;
    color: ${({ theme }) => theme.text1};
    border: 1px solid ${({ theme }) => theme.text1};
  }
`

export const FieldWrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 12px;
  padding: 16px;
  flex: 1;
  width: auto;
  display: flex;
  justify-content: space-between;
`

export const FieldLabel = styled.span``
export const Input = styled(NumericalInput)`
  max-width: 100px;
`

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 14px;
  margin-top: 10px;
`
