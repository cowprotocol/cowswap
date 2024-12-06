'use client'

import { TokenInfo } from '../types'
import { CONFIG } from '@/const/meta'
import { Color } from '@cowprotocol/ui'
import { TokenList } from '@/components/TokensList'
import Layout from '@/components/Layout'
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
    <Layout
      metaTitle={`Tokens - ${CONFIG.title}`}
      metaDescription="Track the latest tokens price, market cap, trading volume, and more with CoW DAO's live token price tracker."
      bgColor={Color.neutral90}
    >
      <Wrapper>
        <TokenList tokens={tokens} />
      </Wrapper>
    </Layout>
  )
}
