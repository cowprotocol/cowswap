import { ButtonSecondary, Media } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { NumericalInput } from 'modules/trade/pure/TradeNumberInput/styled'
import { TradeWidgetFieldBox } from 'modules/trade/pure/TradeWidgetField/styled'

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
  color: inherit;

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
  color: inherit;

  > button {
    border-radius: 12px;
  }
`

export const ModalContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: max-content;
  width: 100%;
  grid-gap: 6px;

  ${Media.upToSmall()} {
    grid-template-columns: repeat(1, 1fr);
  }

  > ${TradeWidgetFieldBox} {
    flex-flow: row nowrap;
  }

  > ${TradeWidgetFieldBox} ${NumericalInput} {
    width: 100%;
  }
`

export const CloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: var(${UI.COLOR_TEXT});
  }
`

export const CancelButton = styled(ButtonSecondary)`
  background: transparent;
  color: inherit;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});

  :hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: inherit;
  }
`

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 14px;
  margin-top: 10px;
`
