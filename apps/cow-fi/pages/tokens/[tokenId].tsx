import React from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { getTokensIds as getTokensIds, getTokenDetails as getTokenDetails } from 'services/tokens'
import { TokenDetails as TokenDetailsPure, TokenDetailProps } from '@/components/TokenDetails'
import { GetStaticPaths, GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

export type TokenDetailPageProps = TokenDetailProps

export default function TokenDetailsPage({ token }: TokenDetailPageProps) {
  const { name, symbol, metaDescription, change24h, priceUsd } = token
  const change24 = parseFloat(change24h)
  const change24hFormatted = change24.toFixed(2)
  const isIncrease = parseFloat(change24h) >= 0
  const priceChangeEmoji = isIncrease ? '🟢' : '🔴'
  const changeDirection = isIncrease ? '▲' : '▼'
  const metaTitle = `${priceChangeEmoji} ${name} (${symbol}) $${priceUsd} (${change24hFormatted}% ${changeDirection}) - ${CONFIG.metatitle_tokenDetail}`

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta key="description" name="description" content={metaDescription} />
        <meta key="ogTitle" property="og:title" content={metaTitle} />
        <meta key="ogDescription" property="og:description" content={metaDescription} />
        <meta key="twitterTitle" name="twitter:title" content={CONFIG.title} />
      </Head>

      <Layout fullWidthGradientVariant={true}>
        <TokenDetailsPure token={token} />
      </Layout>
    </>
  )
}

type TokenQuery = { tokenId: string}

export const getStaticPaths: GetStaticPaths<TokenQuery> = async () => {
  const tokenIds = await getTokensIds()

  return {
    fallback: false,
    paths: tokenIds.map((tokenId) => ({ params: { tokenId } })),
  }
}

export const getStaticProps: GetStaticProps<TokenDetailProps, TokenQuery> = async ({ params }) => {
  const token = await getTokenDetails(params.tokenId)

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
