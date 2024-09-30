import React from 'react'

import { getTokensIds as getTokensIds, getTokenDetails as getTokenDetails } from 'services/tokens'
import { TokenDetails as TokenDetailsPure, TokenDetailProps } from '@/components/TokenDetails'
import { GetStaticPaths, GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import { Color } from '@cowprotocol/ui'
import styled from 'styled-components/macro'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

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

export type TokenDetailPageProps = TokenDetailProps

export default function TokenDetailsPage({ token }: TokenDetailPageProps) {
  const { name, symbol, change24h, priceUsd } = token
  const change24 = parseFloat(change24h as string)
  const change24hFormatted = change24.toFixed(2)
  const isIncrease = parseFloat(change24h as string) >= 0
  const priceChangeEmoji = isIncrease ? '🟢' : '🔴'
  const changeDirection = isIncrease ? '▲' : '▼'
  const metaTitle = `${priceChangeEmoji} ${name} (${symbol}) $${priceUsd} (${change24hFormatted}% ${changeDirection}) - ${CONFIG.metatitle_tokenDetail} - ${CONFIG.title}`
  const metaDescription = `Track the latest ${name} (${symbol}) price, market cap, trading volume, and more with CoW DAO's live ${name} price chart.`

  return (
    <Layout metaTitle={metaTitle} metaDescription={metaDescription} bgColor={Color.neutral90}>
      <Wrapper>
        <TokenDetailsPure token={token} />
      </Wrapper>
    </Layout>
  )
}

type TokenQuery = { tokenId: string }

export const getStaticPaths: GetStaticPaths<TokenQuery> = async () => {
  const tokenIds = await getTokensIds()

  return {
    fallback: false,
    paths: tokenIds.map((tokenId) => ({ params: { tokenId } })),
  }
}

export const getStaticProps: GetStaticProps<TokenDetailProps, TokenQuery> = async ({ params }) => {
  const token = params ? await getTokenDetails(params.tokenId) : null

  if (!token) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      token: token,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
