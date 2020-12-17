// import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, CurrencySelect, InputRow } from './CurrencyInputPanelMod'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override
  ${InputRow} {
  }

  ${CurrencySelect} {
    background-color: transparent;
    /* background-image: linear-gradient(270deg, #8958FF 0%, #3F77FF 100%); */
    background-image: ${({ selected, theme }) =>
      selected ? 'none' : `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%)`};
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
