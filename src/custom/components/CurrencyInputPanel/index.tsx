// import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import CurrencyInputPanelMod, {
  CurrencyInputPanelProps,
  CurrencySelect as CurrencySelectMod,
  InputRow,
  InputPanel,
  LabelRow,
  Container
} from './CurrencyInputPanelMod'
import { RowBetween } from 'components/Row'

import { StyledLogo } from 'components/CurrencyLogo'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override

  ${InputPanel} {
    background: transparent;
    color: ${({ theme }) => theme.currencyInput?.color};

    &:hover {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${LabelRow} {
    color: ${({ theme }) => theme.currencyInput?.color};
    span:hover {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${InputRow} {
    background: transparent;
    > input,
    > input::placeholder {
      background: transparent;
      color: inherit;
    }

    > input::placeholder {
      opacity: 0.5;
    }
  }

  ${Container} {
    background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
    border: ${({ theme }) =>
      theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
  }

  ${CurrencySelectMod} {
    color: ${({ selected, theme }) =>
      selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
    transition: background-color 0.2s ease-in-out;

    &:focus {
      background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
    }
    &:hover {
      background-color: ${({ theme }) => darken(0.05, theme.primary1)};
    }

    path {
      stroke: ${({ selected, theme }) =>
        selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
      stroke-width: 1.5px;
    }
  }

  ${RowBetween} {
    color: ${({ theme }) => theme.currencyInput?.color};

    > div > div > span,
    > div {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${StyledLogo} {
    background: ${({ theme }) => theme.bg1};
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
