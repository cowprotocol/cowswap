import React from 'react'
import styled from 'styled-components'
import ToggleUni, { ToggleProps as TogglePropsUni } from '@src/components/Toggle'

export type ToggleProps = TogglePropsUni

const Wrapper = styled(ToggleUni)`
  .disabled {
    color: ${({ theme }) => theme.white};
  }
`

export default function Toggle(props: ToggleProps) {
  return <Wrapper {...props} />
}
