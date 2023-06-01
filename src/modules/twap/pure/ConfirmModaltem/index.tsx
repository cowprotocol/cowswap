import { ReactNode } from 'react'

import { CornerDownRight } from 'react-feather'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin-right: 5px;
  }
`

export function ConfirmModalItem({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <CornerDownRight size={16} />
      {children}
    </Wrapper>
  )
}
