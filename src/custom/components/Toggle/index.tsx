import React from 'react'
import styled from 'styled-components'
import ToggleUni, { ToggleProps as TogglePropsUni, ToggleElement } from '@src/components/Toggle'

export type ToggleProps = TogglePropsUni

const Wrapper = styled(ToggleUni)`
  ${ToggleElement} {
    color: ${({ theme }) => theme.black};
    border: 2px solid transparent;
    transition: border 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.black};
      border: 2px solid ${({ theme }) => theme.black};
    }
  }
  .disabled {
    background: ${({ theme }) => theme.primary1};
  }
`

export default function Toggle(props: ToggleProps) {
  return <Wrapper {...props} />
}
