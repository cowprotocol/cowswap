'use client'

import { JSX } from 'react'

import styled from 'styled-components/macro'

import { type TokenDetails } from '../types'

import { TokenDetails as TokenDetailsPure } from '@/components/TokenDetails'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1640px;
  width: 100%;
  margin: 56px auto;
  gap: 24px;
  font-size: 1.6rem;
`

interface TokenPageComponentProps {
  token: TokenDetails
}

export function TokenPageComponent({ token }: TokenPageComponentProps): JSX.Element {
  return (
    <Wrapper>
      <TokenDetailsPure token={token} />
    </Wrapper>
  )
}
