'use client'

import styled from 'styled-components/macro'
import { Color } from '@cowprotocol/ui'
import { TokenDetails as TokenDetailsPure } from '@/components/TokenDetails'
import Layout from '@/components/Layout'
import { type TokenDetails } from '../types'

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
  metaTitle: string
  metaDescription: string
  token: TokenDetails
}

export function TokenPageComponent({ metaDescription, token, metaTitle }: TokenPageComponentProps) {
  return (
    <Layout metaTitle={metaTitle} metaDescription={metaDescription} bgColor={Color.neutral90}>
      <Wrapper>
        <TokenDetailsPure token={token} />
      </Wrapper>
    </Layout>
  )
}
