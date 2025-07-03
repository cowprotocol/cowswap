import React, { ReactNode } from 'react'

import styled from 'styled-components/macro'

import CowLoading from '../CowLoading'

const Wrapper = styled.div`
  text-align: center;
  margin: 50px 0;

  h3 {
    font-size: var(--font-size-larger);
    font-weight: var(--font-weight-normal);
    color: var(--color-text-primary);
    margin-top: 10px;
  }
`

interface LoadingWrapperProps {
  message?: string
  children?: ReactNode
}

export function LoadingWrapper({ message, children }: LoadingWrapperProps): ReactNode {
  return (
    <Wrapper>
      <CowLoading />
      {message && <h3>{message}</h3>}
      {children}
    </Wrapper>
  )
}
