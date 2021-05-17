// import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import CurrencyInputPanelMod, {
  CurrencyInputPanelProps,
  CurrencySelect as CurrencySelectMod,
  InputRow,
  Container
} from './CurrencyInputPanelMod'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override

  ${InputRow} {
    background: transparent;
    > input {
      background: transparent;
    }
  }

  ${Container} {
    background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
    border: ${({ theme }) =>
      theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
  }

  ${CurrencySelectMod} {
    color: ${({ theme }) => theme.black};
    transition: background-color 0.2s ease-in-out;

    &:focus {
      background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
    }
    &:hover {
      background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    }

    path {
      stroke: ${({ selected, theme }) => (selected ? theme.black : theme.black)};
      stroke-width: 1.5px;
    }
  }
`

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const { currency } = props
  return (
    <Wrapper selected={!!currency}>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
