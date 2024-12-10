'use client'

import { TokenInfo } from '../types'
import { TokenList } from '@/components/TokensList'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 56px auto;
  gap: 24px;
  font-size: 1.6rem;
`

interface TokensPageComponentProps {
  tokens: TokenInfo[]
}

export function TokensPageComponent({ tokens }: TokensPageComponentProps) {
  return (
    <Wrapper>
      <TokenList tokens={tokens} />
    </Wrapper>
  )
}
